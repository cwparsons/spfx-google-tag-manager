# Google Tag Manager application customizer

This application customizer for SharePoint Online adds Google Tag Manager to your
SharePoint site.

This is licensed under MIT.

## Installation

1. Download the [latest](https://github.com/cwparsons/spfx-google-tag-manager/releases/latest)
   `.sppkg` release.
2. Go to your SharePoint's tenant [app catalog](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog).
3. Upload the _spfx-google-tag-manager-{version}.sppkg_ package.
4. Determine whether or not the client-side solution should be made available to
   all sites in the organization ([tenant wide](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/basics/tenant-wide-deployment-extensions)).
   Note that this solution will require additional permissions and informs you
   that it will request _User.ReadBasic.All_ from Microsoft Graph.
5. Click _Deploy_ to deploy the solution.
6. **(Optional):** If in step #4, the solution was not made tenant wide, go to
   the site that the web part should be placed on. In the _Site Contents_, add
   the new _spfx-google-tag-manager-client-slide-solution_ app.
7. **(Optional):** Use the query string parameter `?spfx-google-tag-manager-properties=true` to
   enable a form to edit the custom action and add the Google Tag Manager container ID.

### Content Security Policy

This solution loads the Google Tag Manager container script at runtime with
[`SPComponentLoader.loadScript`](https://learn.microsoft.com/en-us/javascript/api/sp-loader/spcomponentloader),
since the container ID (and therefore the script URL) is configured per site and
isn't known at build time. Because of this, SharePoint Online can't automatically
add it to **Trusted script sources**, unlike libraries declared as build-time
`externals` — see [Support for Content Security Policy (CSP) in SharePoint Online](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/content-securty-policy-trusted-script-sources).

Once CSP enforcement is turned on for your tenant, a SharePoint admin must add the
following entries under **SharePoint admin center** > **Advanced** > **Script sources**
for this solution to keep working:

- `https://www.googletagmanager.com/`
- `https://tagmanager.google.com/`
- `https://*.googleanalytics.com/`

## Building

This application customizer is built with the [SharePoint Framework (SPFx)](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/overview-client-side-web-parts).
It can be cloned and built using the normal SPFx `gulp` tasks, or by using the
following npm scripts:

- `npm run serve:browser` to start a local development server using SharePoint
  Workbench and mock data.
- `npm run serve` to start a local development server to run against a real
  SharePoint environment
- `npm run dist` to create a production build and package

### Version numbering

Multiple areas of the code base need to be updated when making a version number
change. This has been automated in a preversion script, so using `npm vesrion`
is required.
