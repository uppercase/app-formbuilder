const api = require('/lib/api/stripe');

/**
 * This service is used by the form content type.
 * Will fetch all SKUs from the Stripe API and display
 * them in a custom selector.
 */
exports.get = function(req) {
    return api.fetchSKUs({expand: ['data.product']}, (err, response) => {
        if (err) {
            log.error(err);
            return {
                body: {
                    error: 'Internal server error',
                },
            };
        }

        var body = { count: 0, total: 0, hits: [] };

        var parsed = JSON.parse(response.body);
    
        if (parsed) {
            var hits = parsed.data.map(function(sku) { 
                return {
                    id: sku.id,
                    displayName: sku.product.name,
                    description: sku.attributes.name + ' (' + sku.currency.toUpperCase() + fix('' + sku.price) + ')',
                };
            });
    
            body = {
                count: hits.length, 
                total: hits.length, 
                hits: hits,
            };
        }
    
        return {
            contentType: 'application/json',
            body: body,
        };
    });
};

function fix(str) {
    if (!str.length) return '0.00';
    return str.substr(0, str.length - 2) + '.' + str.substr(str.length - 2);
}
