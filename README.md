# Google Tag Manager application customizer

This application customizer for SharePoint Online adds Google Tag Manager to your
SharePoint site.

This is licensed under MIT.

## Installation

1. Download the [latest](https://github.com/cwparsons/spfx-google-tag-manager/releases/latest)
   `.sppkg` release.
2. Go to your SharePoint's tenant [app catalog](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog).
3. Upload the *spfx-google-tag-manager-{version}.sppkg* package.
4. Determine whether or not the client-side solution should be made available to
   all sites in the organization ([tenant wide](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/basics/tenant-wide-deployment-extensions)).
   Note that this solution will require additional permissions and informs you
   that it will request *User.ReadBasic.All* from Microsoft Graph.
5. Click *Deploy* to deploy the solution.
6. **(Optional):** If in step #4, the solution was not made tenant wide, go to
   the site that the web part should be placed on. In the *Site Contents*, add
   the new *spfx-google-tag-manager-client-slide-solution* app.


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
