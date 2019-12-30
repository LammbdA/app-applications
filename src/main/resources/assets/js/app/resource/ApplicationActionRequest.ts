import * as Q from 'q';
import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Path} from 'lib-admin-ui/rest/Path';

export class ApplicationActionRequest
    extends ApplicationResourceRequest<void, void> {

    private applicationKeys: ApplicationKey[];
    private action: string;

    constructor(applicationKeys: ApplicationKey[], action: string) {
        super();
        super.setMethod('POST');
        this.applicationKeys = applicationKeys;
        this.action = action;
    }

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), this.action);
    }

    getParams(): Object {
        return {
            key: ApplicationKey.toStringArray(this.applicationKeys)
        };
    }

    sendAndParse(): Q.Promise<void> {

        const result = Q.defer<void>();

        this.send().catch(e => result.reject(e));

        return result.promise;
    }
}
