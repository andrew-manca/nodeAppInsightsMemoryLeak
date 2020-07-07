import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import appInsights = require('applicationinsights');

import * as _ from 'lodash';
import * as v8 from 'v8';





import * as data from './test.json';
export type NonPrimitive = { [key: string]: any };
import {trackMemUsage} from './OtherFunctions'
import {trackHeapStats} from './OtherFunctions'
import {flatten} from './OtherFunctions'

const appInsightsClient: appInsights.TelemetryClient = appInsights.defaultClient;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    trackMemUsage(context, appInsightsClient, 'Starting Main()');
    trackHeapStats(context, appInsightsClient, 'Starting Main()');

    appInsightsClient.trackEvent({
        name: 'Logging a flattened random message',
        properties: flatten(data),
    });    
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));

    if (name) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};

export default httpTrigger;
