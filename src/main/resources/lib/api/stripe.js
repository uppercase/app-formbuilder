const portal = require('/lib/xp/portal');
const httpClient = require('/lib/http-client');
const qs = require('/lib/qs');

/**
 * This function creates a new HTTP request towards the Stripe API given a URL, HTTP method, parameters, body.
 * Will also fetch the api secret key from site config to fullfill the request. If the secret key has not
 * been set an error will be thrown.
 * 
 * @param {*} args 
 */
function makeRequest(args) {
    const siteConfig = portal.getSiteConfig();

    if (!siteConfig.stripeSecretKey) {
        throw new Error('Stripe secret key has not been set in site config');
    }

    return httpClient.request({
        url: args.url,
        method: args.method,
        params: args.params,
        body: args.body,
        connectionTimeout: 20000,
        readTimeout: 5000,
        contentType: 'application/json',
        auth: {
            user: siteConfig.stripeSecretKey,
            password: '',
        },
        headers: {
            'Cache-Control': 'no-cache',
        },
    });
}

/**
 * Create a new checkout session with parameters
 */
exports.createSessionToken = function(params, callback) {
    try {
        return callback(null, makeRequest({
            url: 'https://api.stripe.com/v1/checkout/sessions?' + qs.stringify(params),
            method: 'POST',
        }));
    } catch(err) {
        return callback('Could not create session token from Stripe API with params ' + JSON.stringify(params) + ": " + err, null)
    }
}

/**
 * Fetches all SKUs from the Stripe account
 */
exports.fetchSKUs = function(params, callback) {
    try {
        return callback(null, makeRequest({
            url: 'https://api.stripe.com/v1/skus?' + qs.stringify(params) ,
            method: 'GET',
            /*
            params: {
                expand: ['data.product'],
            }
            */
        }));
    } catch(err) {
        return callback('Could not fetch SKUs from Stripe API:' + err, null);
    }
}

/**
 * Fetch a single SKU object by its identifier
 */
exports.fetchSKU = function(sku, callback) {
    try {
        return callback(null, makeRequest({
            url: 'https://api.stripe.com/v1/skus/' + sku,
            method: 'GET',
        }));
    } catch(err) {
        return callback('Could not fetch SKU with id: ' + sku + ' from Stripe API:' + err, null);
    }
}
