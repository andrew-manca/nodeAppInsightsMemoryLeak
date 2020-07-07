import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import appInsights = require('applicationinsights');

import * as _ from 'lodash';
import * as v8 from 'v8';





import * as data from './test.json';
export type NonPrimitive = { [key: string]: any };

export function trackProccessMemUsage(
    context: Context,
    appInsightsClient: appInsights.TelemetryClient,
    label = '',
): void {
    const usage = process.memoryUsage();

    appInsightsClient.trackMetric({
        name: `Memory Usage: heapUsed`,
        value: usage.heapUsed,
        properties: { invocationid: context.invocationId, label: label },
    });
    appInsightsClient.trackMetric({
        name: `Memory Usage: heapTotal`,
        value: usage.heapTotal,
        properties: { invocationid: context.invocationId, label: label },
    });
    appInsightsClient.trackMetric({
        name: `Memory Usage: rss`,
        value: usage.rss,
        properties: { invocationid: context.invocationId, label: label },
    });
}

export const trackMemUsage = _.throttle(trackProccessMemUsage, 1000);

export function trackV8HeapStats(context: Context, appInsightsClient: appInsights.TelemetryClient, label = ''): void {
    const v8stats = v8.getHeapStatistics();
    const v8StatsFiltered = _.mapValues(_.omit(v8stats, ['does_zap_garbage']), val => `${val}`);

    appInsightsClient.trackEvent({
        name: 'V8 Heap Statistics',
        properties: { ...v8StatsFiltered, label: label },
    });
}

export const trackHeapStats = _.throttle(trackV8HeapStats, 1000);

/**
 * Flattens the provided JSON object
 *
 * @param {*} obj Object to flatten
 * @param {string} [path=''] For use in recursion
 * @returns Flattend Json Object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flatten: (obj: any, path?: string) => NonPrimitive = (obj, path = '') => {
    if (!(obj instanceof Object)) return { [path.replace(/\.$/g, '')]: obj };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(obj).reduce((output: {}, key: any) => {
        if (obj instanceof Array) {
            return { ...output, ...flatten(obj[key], path + '[' + key + '].') };
        } else {
            return { ...output, ...flatten(obj[key], path + key + '.') };
        }
    }, {});
};

export const initAppInsights = (): void => {
    appInsights
        .setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(false)
        .start();
};
initAppInsights();

const appInsightsClient: appInsights.TelemetryClient = appInsights.defaultClient;

