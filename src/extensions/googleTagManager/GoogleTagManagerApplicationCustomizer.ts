import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { Log } from '@microsoft/sp-core-library';
import { SPComponentLoader } from '@microsoft/sp-loader';

import { IGoogleTagManagerApplicationCustomizerProperties } from './IGoogleTagManagerApplicationCustomizerProperties';

const LOG_SOURCE = 'GoogleTagManagerApplicationCustomizer';

const PROPERTIES_DIALOG_QUERY_STRING_KEY = 'spfx-google-tag-manager-properties';

declare global {
  interface Window {
    google_tag_manager: any;
    dataLayer: any[];
  }
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GoogleTagManagerApplicationCustomizer extends BaseApplicationCustomizer<IGoogleTagManagerApplicationCustomizerProperties> {
  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized Google Tag Manager application customizer.`);

    this.showPropertiesDialogIfRequested().catch((error: Error) => {
      Log.error(LOG_SOURCE, error, this.context.serviceScope);
    });

    if (!this.properties.containerId) {
      Log.error(
        LOG_SOURCE,
        new Error(`Container ID for Google Tag Manager application customizer was not provided.`),
        this.context.serviceScope
      );

      return;
    }

    // If Google Tag Manager is not yet loaded on the page...
    if (!window.google_tag_manager) {
      // Set up the data layer variable and seed it the same way the standard GTM
      // snippet does, before the container script itself is loaded.
      window.dataLayer = window.dataLayer || [];

      // Session-scoped dimensions. Pushed before `gtm.js` so the value is already in
      // the data layer when tags firing on initialization or page view read it.
      await this.sendUserId();

      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

      // See: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/content-securty-policy-trusted-script-sources
      await SPComponentLoader.loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(this.properties.containerId)}`);
    }

    // Create a custom event on page navigation for Google Tag Manager to create a
    // virtual page view tag against this trigger.
    this.context.application.navigatedEvent.add(this, this.onNavigatedEvent);
  }

  @override
  public onDispose(): void {
    this.context.application.navigatedEvent.remove(this, this.onNavigatedEvent);
  }

  private async showPropertiesDialogIfRequested(): Promise<void> {
    const queryStringValue = new URLSearchParams(window.location.search).get(PROPERTIES_DIALOG_QUERY_STRING_KEY);

    if (queryStringValue !== 'true') {
      return;
    }

    const { PropertiesDialog } = await import(
      /* webpackChunkName: 'google-tag-manager-properties-dialog' */
      './PropertiesDialog'
    );

    const dialog = new PropertiesDialog(this.properties, this.context, this.componentId);

    await dialog.show();
  }

  private onNavigatedEvent(): void {
    window.dataLayer.push({
      event: 'NavigatedEvent',
      url: `${window.location.pathname}${window.location.search}`
    });
  }

  private async sendUserId(): Promise<void> {
    if (!this.properties.enableUserId) {
      return;
    }

    let userId = this.context.pageContext.aadInfo.userId.toString();

    if (this.properties.enableUserIdEncryption) {
      const tenantId = this.context.pageContext.aadInfo.tenantId.toString();

      const encoder = new TextEncoder();
      const data = encoder.encode(`${tenantId}_${userId}`);
      const digest = await crypto.subtle.digest('SHA-256', data);

      // Convert the digest to a hex string. Pushing the raw ArrayBuffer serializes
      // to the same value for every user, which collapses them into one in Google Analytics.
      userId = Array.from(new Uint8Array(digest))
        .map((byte) => `0${byte.toString(16)}`.slice(-2))
        .join('');
    }

    window.dataLayer.push({
      userId
    });
  }
}
