const updateCartCurrencyObj = {
  'GB': 'GBP',
  'US': 'USD',
  'AUS': 'AUD'
}

const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'AUD': '$',
  'CAD': '$'
}

// Currency select dropdown
let $currencySelect = $('.shopify-currency-form select');

function roundNumberToNearestWhole(convertedPrice) {
  return convertedPrice.toFixed(2);
}

function convertPriceToInt(rawPrice, defaultCurrency) {
  if (defaultCurrency == 'EUR') {
    rawPrice = rawPrice.replace(",",".");
  }
  return Number(rawPrice.replace(/[^0-9\.-]+/g,""));
}

function removeCurrencySymbol(string) {
  return string.replace(/[£$€]/g, "").trim();
}

function convertPricesToChosenCurrency(defaultCurrency, newCurrency) {
  $("span.price-item.price-item--regular").each(function() {
    let rawPrice = $(this).html();
    let priceAsInt = convertPriceToInt(rawPrice, defaultCurrency);
    let convertedPrice = Currency.convert(priceAsInt,defaultCurrency,newCurrency)
    let roundedPrice = roundNumberToNearestWhole(convertedPrice);
    if(newCurrency == 'EUR') {
      roundedPrice = roundedPrice.replace(".",",");
    }
    $(this).html(currencySymbols[newCurrency] + roundedPrice);
  });
}

function updateCartCurrency(newCurrency) {
  let defaultCurrency = cartCurrencyCookie();

  $.ajax({
    url: '/cart/update.js',
    dataType: 'JSON',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({"currency": newCurrency})
  });

  $currencySelect.children().removeAttr("selected");
  $currencySelect.find(`option:contains(${newCurrency})`).prop('selected', true)
  convertPricesToChosenCurrency(defaultCurrency,newCurrency);
}

function cartCurrencyCookie() {
  return Cookies.get('cart_currency')
}

if(Cookies.get('set_currency') === undefined) {
  console.log('set_currency is not defined');
  $.getJSON('https://get.geojs.io/v1/ip/country.json', function(data) {
    let geoCurrency = updateCartCurrencyObj[data.country];
    if(geoCurrency == undefined){
      updateCartCurrency(geoCurrency);
    } else {
      updateCartCurrency(geoCurrency);
    }
  });
  Cookies.set('set_currency', 'true', { expires: 7 })
}
