import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE = 'GoogleTagManagerApplicationCustomizer';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface IGoogleTagManagerApplicationCustomizerProperties {
  containerId: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GoogleTagManagerApplicationCustomizer extends BaseApplicationCustomizer<
  IGoogleTagManagerApplicationCustomizerProperties
> {
  @override
  public async onInit() {
    Log.info(LOG_SOURCE, `Initialized Google Tag Manager application customizer.`);

    if (window['google_tag_manager']) {
      Log.info(LOG_SOURCE, `Google Tag Manager has already been initialized once on this page.`, this.context.serviceScope);
    }

    if (!this.properties.containerId) {
      Log.error(
        LOG_SOURCE,
        new Error(`Container ID for Google Tag Manager application customizer was not provided.`),
        this.context.serviceScope
      );

      return;
    }

    // Set up the data layer variable.
    window.dataLayer = window.dataLayer || [];

    // Create a custom event on page navigation for Google Tag Manager to create a
    // virtual pageview tag against this trigger.
    this.context.application.navigatedEvent.add(this, this.onNavigatedEvent);
    this.context.placeholderProvider.changedEvent.add(this, this.onNavigatedEvent);

    // Add Google Tag Manager
    const script = this.createGtagScript(this.properties.containerId);
    document.head.appendChild(script);
  }

  @override
  public onDispose() {
    this.context.application.navigatedEvent.remove(this, this.onNavigatedEvent);
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
}
