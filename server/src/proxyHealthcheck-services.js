import restify from 'restify';
import axios from 'axios';

export default {
	register (server) {

        // Calling healthcheck URLs from a browser often gets CORS errors.
        // This is where the server being called for the healthcheck is a
        // different domain name to Juice. The browser and the server talk to
        // each other to see if this is allowed. It is often blocked to prevent
        // hackers. By calling the healthcheck from here, we bypass the browser checks.
        server.get('/api/proxyHealthcheck', async (req, res, next) => {
            // console.log(`GET /proxyHealthcheck`);

            const healthcheckUrl = req.query.url
            if (!healthcheckUrl) {
                res.send({ status: 'missing url', text: 'missing URL'})
                return next
            }
            console.log(`GET /proxyHealthcheck - ${healthcheckUrl}`);

            try {
                const before = Date.now()
                let result = await axios.get(healthcheckUrl, {
                    timeout: 4000,
                    // crossdomain: true
                });
                const after = Date.now()
                const duration = after - before
        
                // deployment._healthcheck_status = 'zok'
                // return
                // console.log(`result is `, result);
                let status = result.status
                // console.log(`status is`, status);
                // console.log(`data is`, result.data);
                if (result.status >= 200 && result.status <= 299) {
                    // Success. Hopefully a JSON reply.
                    let msg = `${result.status} ${result.statusText}, ${duration}ms`
                    if (result.headers['content-type'].startsWith('application/json')) {
                        msg += ',    ' + JSON.stringify(result.data, '', 2)
                    } else {
                        // msg = `Status: ${result.status} statusText: ${result.statusText}`
                        msg += `    type:${result.headers['content-type']}`
                    }
                    res.send({ status: 'OK', body: msg })
                    return next()
                } else if (status == 'error') {
                    res.send({ status: 'error', body: 'Unknown error'})
                    return next()
                }
            
            } catch (error) {
                console.log(`error`);
                if (error.response) {
                    // standard axios exception
                    console.log(`status is ${error.response.status}`);
                    if (error.response.status === 404) {
                        // ENOENT - the pinged server says the page does not exist
                        console.log(`${healthcheckUrl}: ENOENT`);
                        res.send({ status: 'ENOENT', body: 'ENOENT (url okay, but bad path)'})
                        return next()
                    }
                } else if (error.message === 'Network Error') {
                    console.log(`${healthcheckUrl}: Network error`);
                    res.send({ status: 'network', body: 'Network error'})
                    return next()
                } else if (error.code === 'ECONNABORTED') {
                    // See https://medium.com/@masnun/handling-timeout-in-axios-479269d83c68
                    console.log(`${healthcheckUrl}: ECONNABORTED (timeout)`);
                    res.send({ status: 'ECONNABORTED', body: 'ECONNABORTED: connection timed out'})
                    return next()
                } else if (error.code === 'ENOTFOUND') {
                    // Invalid website URL
                    console.log(`${healthcheckUrl}: ENOTFOUND (unknown domain name)`);
                    res.send({ status: 'ENOTFOUND', body: 'ENOTFOUND: Invalid website URL'})
                    return next()
                }

                // Unknown error type
                console.log(`error doing healthcheck:`, error);
                console.log(`error.statusCode`, error.statusCode);
                console.log(`error.errcode`, error.errcode);
                console.log(`error.errno`, error.errno);
                console.log(`error.code`, error.code);
                console.log(`error.message`, error.message);
                // console.log(`error.response`, error.response);
                let json=JSON.stringify(error, '', 2);
                console.log(`json=`, json);
                let errorObject=JSON.parse(JSON.stringify(error));
                console.log(`errorObject=`, errorObject);
                res.send({ status: 'error', body: '{ "yarp": "yahoo" }'})
                next()
            }//- catch
        })//- GET
    }//- register
}