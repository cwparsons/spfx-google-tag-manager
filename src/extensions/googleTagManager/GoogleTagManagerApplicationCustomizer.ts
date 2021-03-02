import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { Log } from '@microsoft/sp-core-library';
import sha256 from 'crypto-js/sha256';

const LOG_SOURCE = 'GoogleTagManagerApplicationCustomizer';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface IGoogleTagManagerApplicationCustomizerProperties {
  containerId: string;
  enableUserId: boolean;
  enableUserIdEncryption: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GoogleTagManagerApplicationCustomizer extends BaseApplicationCustomizer<IGoogleTagManagerApplicationCustomizerProperties> {
  @override
  public async onInit() {
    Log.info(LOG_SOURCE, `Initialized Google Tag Manager application customizer.`);

    if (!this.properties.containerId) {
      Log.error(
        LOG_SOURCE,
        new Error(`Container ID for Google Tag Manager application customizer was not provided.`),
        this.context.serviceScope
      );

      return;
    }

    // If Google Tag Manager is not yet loaded on the page...
    if (!window['google_tag_manager']) {
      // Set up the data layer variable.
      window.dataLayer = window.dataLayer || [];

      // Add the script to the page.
      const script = this.createGtagScript(this.properties.containerId);
      document.head.appendChild(script);

      // Session-scoped dimensions
      await this.sendUserId();
    }

    // Create a custom event on page navigation for Google Tag Manager to create a
    // virtual page view tag against this trigger.
    this.context.application.navigatedEvent.add(this, this.onNavigatedEvent);
  }

  @override
  public onDispose() {
    this.context.application.navigatedEvent.remove(this, this.onNavigatedEvent);
  }

  private createGtagScript(containerId: string) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');`;

    return script;
  }

  private onNavigatedEvent() {
    window.dataLayer.push({
      event: 'NavigatedEvent',
      url: `${window.location.pathname}${window.location.search}`
    });
  }

  private async sendUserId() {
    if (!this.properties.enableUserId) {
      return;
    }

    let userId = this.context.pageContext.aadInfo.userId.toString();

    if (this.properties.enableUserIdEncryption) {
      const tenantId = this.context.pageContext.aadInfo.tenantId.toString();

      userId = sha256(`${tenantId}_${userId}`).toString();
    }

    window.dataLayer.push({
      userId
    });
  }
}
