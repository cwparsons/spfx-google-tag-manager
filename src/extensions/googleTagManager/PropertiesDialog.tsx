import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog } from '@microsoft/sp-dialog';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

import { CustomActionPropertiesService } from './CustomActionPropertiesService';
import { IGoogleTagManagerApplicationCustomizerProperties } from './IGoogleTagManagerApplicationCustomizerProperties';
import { PropertiesForm } from './PropertiesForm';

/**
 * Lets a site owner review and edit the properties (container ID, user ID tracking) of this
 * application customizer's underlying custom action, without needing PowerShell/PnP access.
 * Only ever loaded when `?spfx-google-tag-manager-properties=true` is present in the URL.
 */
export class PropertiesDialog extends BaseDialog {
  private readonly propertiesService: CustomActionPropertiesService;

  public constructor(
    private readonly properties: IGoogleTagManagerApplicationCustomizerProperties,
    private readonly context: ApplicationCustomizerContext,
    private readonly componentId: string
  ) {
    super({ isBlocking: false });

    this.propertiesService = new CustomActionPropertiesService(this.context);
  }

  protected render(): void {
    ReactDOM.render(
      <PropertiesForm
        initialProperties={this.properties}
        onSave={this.handleSave}
        onCancel={this.handleCancel}
        onReload={this.handleReload}
      />,
      this.domElement
    );
  }

  protected onAfterClose(): void {
    super.onAfterClose();

    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  private readonly handleSave = async (properties: IGoogleTagManagerApplicationCustomizerProperties): Promise<void> => {
    const location = await this.propertiesService.findCustomAction(this.componentId);

    if (!location) {
      throw new Error(
        'Could not find a custom action on this site or site collection to update. ' +
          'If this solution is deployed tenant-wide, update its properties from the app catalog instead.'
      );
    }

    await this.propertiesService.updateProperties(location, properties);
  };

  private readonly handleCancel = (): void => {
    this.close().catch(() => {
      /* Ignore. The dialog has no state left to reconcile if closing fails. */
    });
  };

  private readonly handleReload = (): void => {
    window.location.reload();
  };
}
