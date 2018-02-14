import { createNumberMask } from '../index';

describe('Number mask', () => {
  it('should add the prefix to formatted input', () => {
    const prefix = 'prefix 1@,.';
    const number = 90;

    const mask = createNumberMask({ prefix });
    expect(mask.format(number)).toBe(`${prefix}${number.toLocaleString()}`);
  });

  it('should add the suffix to formatted input', () => {
    const suffix = '1@,. suffix';
    const number = 90;

    const mask = createNumberMask({ suffix });
    expect(mask.format(number)).toBe(`${number.toLocaleString()}${suffix}`);
  });

  it('should have the correct amount of decimal places', () => {
    const prefix = 'p';
    const suffix = 's';
    const decimalPlaces = 5;
    const number = 1234.56789;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });
    expect(mask.format(number)).toBe(
      `${prefix}${number.toLocaleString('browser', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })}${suffix}`,
    );
  });

  it('should be formatting the number according to the locale', () => {
    // The default node build includes only en-US locale.
    const locale = 'en-US';
    const decimalPlaces = 1;
    const number = 1000;

    const mask = createNumberMask({ decimalPlaces, locale });
    expect(mask.format(number)).toBe('1,000.0');
  });

  it('should be formatting correctly when the value is stored as a string', () => {
    const string = '1234.567';
    const decimalPlaces = 3;
    const locale = 'en-US';
    const stringValue = true;

    const mask = createNumberMask({ decimalPlaces, locale, stringValue });
    expect(mask.format(string)).toBe('1,234.567');
  });

  it('should be formatting as zero when the value on the store is undefined', () => {
    const mask = createNumberMask();
    expect(mask.format()).toBe(Number(0).toLocaleString());
  });

  it('should update the stored value correctly', () => {
    const prefix = 'prefix 1@,.';
    const suffix = '1@,. suffix';
    const decimalPlaces = '4';
    const stringValue = true;

    const prefixMask = createNumberMask({ prefix });
    const suffixMask = createNumberMask({ suffix });
    const decimalPlacesMask = createNumberMask({ decimalPlaces });
    const stringValueMask = createNumberMask({ stringValue });
    const allMask = createNumberMask({
      prefix,
      suffix,
      decimalPlaces,
      stringValue,
    });

    expect(prefixMask.normalize(`${prefix}1,2345`)).toBe(12345);
    expect(prefixMask.normalize(`${prefix}1,2340`)).toBe(12340);

    expect(suffixMask.normalize(`1,2345${suffix}`)).toBe(12345);
    expect(suffixMask.normalize(`1,2340${suffix}`)).toBe(12340);

    expect(decimalPlacesMask.normalize(`1,234.56789`)).toBe(12345.6789);
    expect(decimalPlacesMask.normalize(`1,234.56780`)).toBe(12345.678);

    expect(stringValueMask.normalize('1,2345')).toBe('12345');
    expect(stringValueMask.normalize('1,2340')).toBe('12340');

    expect(allMask.normalize(`${prefix}1,234.56789${suffix}`)).toBe(
      '12345.6789',
    );
    expect(allMask.normalize(`${prefix}1,234.56780${suffix}`)).toBe(
      '12345.678',
    );
  });

  it('should not update the stored value if the input is invalid', () => {
    const prefix = 'prefix 1@,.';
    const changedPrefix = prefix.substring(0, prefix.length - 1);
    const suffix = '1@,. suffix';
    const changedSuffix = prefix.substring(1, suffix.length);

    const updatedValue = '1,2345';
    const previousValue = 1234;

    const mask = createNumberMask({ prefix, suffix });

    expect(mask.normalize(updatedValue, previousValue)).toBe(previousValue);
    expect(
      mask.normalize(`${changedPrefix}${updatedValue}${suffix}`, previousValue),
    ).toBe(previousValue);
    expect(
      mask.normalize(`${prefix}${updatedValue}${changedSuffix}`, previousValue),
    ).toBe(previousValue);
  });

  it('should ignore any non-alphanumeric characters inputted', () => {
    const prefix = 'p';
    const suffix = 's';
    const decimalPlaces = 1;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });

    expect(mask.normalize(`${prefix}1,234a${suffix}`)).toBe(123.4);
    expect(mask.normalize(`${prefix}a1,!2?3.4/${suffix}`)).toBe(123.4);
  });

  it('should call onChange if it is passed as an option', () => {
    const onChange = jest.fn();
    const mask = createNumberMask({ onChange });

    const updatedValue = mask.normalize('123,456,789');

    expect(onChange).toBeCalledWith(updatedValue);
  });

  it('should fix the caret position before the suffix', async () => {
    // needed because we use setTimeout on our manageCaretPosition function
    jest.useFakeTimers();

    const prefix = 'prefix 1@,.';
    const suffix = '1@,. suffix';
    const value = '1,234.56789';
    const decimalPlaces = '5';

    // mocked events
    const event = {
      persist: jest.fn(),
      target: {
        value: `${prefix}${value}${suffix}`,
        setSelectionRange: jest.fn(),
      },
    };

    // prefix 1@,.1,234.56789|
    // caret should be here! ^ in the 22th position
    const correctCaretPosition = 22;

    const mask = createNumberMask({ prefix, suffix, decimalPlaces });

    // simulate events
    mask.onKeyDown(event);
    mask.onMouseDown(event);
    mask.onFocus(event);
    mask.onClick(event);

    jest.runAllTimers();

    expect(event.target.setSelectionRange).toHaveBeenLastCalledWith(
      correctCaretPosition,
      correctCaretPosition,
    );

    expect(event.target.setSelectionRange).toHaveBeenCalledTimes(4);
    expect(event.persist).toHaveBeenCalledTimes(4);

    // these are used just to cover the else statements
    mask.onKeyDown({});
    mask.onKeyDown({
      target: {
        value: `${prefix}${value}${suffix}`,
        setSelectionRange: () => {},
      },
    });
  });

  it('should force the input prop "autocomplete" to "off"', () => {
    const mask = createNumberMask();

    expect(mask.autoComplete).toBe('off');
  });
});