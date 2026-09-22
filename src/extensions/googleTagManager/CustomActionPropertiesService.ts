import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

import { IGoogleTagManagerApplicationCustomizerProperties } from './IGoogleTagManagerApplicationCustomizerProperties';

type CustomActionScope = 'web' | 'site';

export interface ICustomActionLocation {
  scope: CustomActionScope;
  id: string;
}

interface IUserCustomAction {
  Id: string;
}

interface IUserCustomActionsResponse {
  value: IUserCustomAction[];
}

const SCOPES: CustomActionScope[] = ['web', 'site'];

/**
 * Looks up and updates the SharePoint UserCustomAction backing this application customizer, so
 * that property changes made through the properties dialog persist beyond the current page load.
 */
export class CustomActionPropertiesService {
  public constructor(private readonly context: ApplicationCustomizerContext) {}

  /**
   * Finds the UserCustomAction whose ClientSideComponentId matches this extension, checking the
   * web first and falling back to the site collection. Returns undefined if the extension was not
   * deployed as a web- or site-scoped custom action (for example, if it's a tenant-wide extension).
   */
  public async findCustomAction(componentId: string): Promise<ICustomActionLocation | undefined> {
    for (const scope of SCOPES) {
      const id = await this.findCustomActionId(scope, componentId);

      if (id) {
        return { scope, id };
      }
    }

    return undefined;
  }

  public async updateProperties(
    location: ICustomActionLocation,
    properties: IGoogleTagManagerApplicationCustomizerProperties
  ): Promise<void> {
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/${location.scope}/UserCustomActions('${location.id}')`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'IF-MATCH': '*',
        'X-HTTP-Method': 'MERGE'
      },
      body: JSON.stringify({
        ClientSideComponentProperties: JSON.stringify(properties)
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update the custom action (${response.status} ${response.statusText}).`);
    }
  }

  private async findCustomActionId(scope: CustomActionScope, componentId: string): Promise<string | undefined> {
    const url =
      `${this.context.pageContext.web.absoluteUrl}/_api/${scope}/UserCustomActions` +
      `?$select=Id&$filter=ClientSideComponentId eq guid'${componentId}'`;

    const response: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to look up the ${scope} custom action (${response.status} ${response.statusText}).`);
    }

    const body: IUserCustomActionsResponse = await response.json();

    return body.value.length > 0 ? body.value[0].Id : undefined;
  }
}
