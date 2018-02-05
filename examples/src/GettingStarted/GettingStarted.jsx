import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';
import { createNumberMask } from '../../../src/index';
import { Markdown } from 'redux-form-website-template';
import { App } from '../App';
import documentation from './GettingStarted.md';

const conversionRate = 6800;

let GettingStarted = props => {
  const btcChange = btc => {
    props.change('gettingStarted', 'EUR', btc * conversionRate);
  };

  const eurChange = eur => {
    props.change('gettingStarted', 'BTC', eur / conversionRate);
  };

  const btcMask = createNumberMask({
    prefix: 'BTC ',
    decimalPlaces: 5,
    locale: 'en-US',
    onChange: btcChange,
  });

  const eurMask = createNumberMask({
    suffix: ' €',
    decimalPlaces: 2,
    locale: 'de',
    onChange: eurChange,
  });

  return (
    <App>
      <div className="path">
        <a href="https://github.com/renato-bohler/redux-form-input-masks">
          redux-form-input-masks
        </a>
      </div>
      <Markdown content={documentation} />
      <form>
        <div>
          <Field name="BTC" component="input" type="tel" {...btcMask} />
          <Field name="EUR" component="input" type="tel" {...eurMask} />
        </div>
      </form>
    </App>
  );
};

const mapStateToProps = undefined;

const mapDispatchToProps = dispatch => ({
  change: (form, field, value) => dispatch(change(form, field, value)),
});

GettingStarted = connect(mapStateToProps, mapDispatchToProps)(GettingStarted);

export default reduxForm({
  form: 'gettingStarted',
})(GettingStarted);
