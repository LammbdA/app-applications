const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallAppDialog = require('../page_objects/applications/install.app.dialog');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Application Browse Panel, check buttons in the toolbar', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const CONTENT_VIEWER_APP = 'Content Viewer App'; // This displayName should be in grid
    const APP_1_CONTENT_VIEWER = 'Content viewer'; // This displayName should be in Uninstall modal dialog
    const APP_2_PROVIDER = 'Auth0 ID Provider';
    const APP_1_DESCRIPTION = 'Inspect your content object JSON';
    const APP_2_DESCRIPTION = 'Add Auth0 authentication to your Enonic XP installation';

    it('WHEN app browse panel is loaded  AND no selections THEN only `Install` button should be enabled',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 'Install' button should be enabled:
            await appBrowsePanel.waitForInstallButtonEnabled();
            // `Start` button should be disabled
            await appBrowsePanel.isStartButtonEnabled();
            // `Stop` button should be disabled
            await appBrowsePanel.isStopButtonEnabled();
            // Uninstall` button should be disabled
            await appBrowsePanel.isUninstallButtonEnabled();
        });

    it.skip('GIVEN Install App dialog is opened WHEN Install button has been clicked in two rows THEN two new applications should appear in the grid',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installAppDialog = new InstallAppDialog();
            // 1. Open Install modal dialog
            await appBrowsePanel.clickOnInstallButton();
            await installAppDialog.waitForGridLoaded();
            await installAppDialog.waitForInstallLink(APP_1_CONTENT_VIEWER);
            // 2. Install two applications and close the modal dialog:
            await installAppDialog.pause(500);
            await installAppDialog.clickOnInstallAppLink(APP_1_CONTENT_VIEWER);
            // 3. Wait for installed
            await installAppDialog.waitForAppInstalled(APP_1_CONTENT_VIEWER);
            await installAppDialog.waitForInstallLink(APP_2_PROVIDER);
            await installAppDialog.clickOnInstallAppLink(APP_2_PROVIDER);
            await installAppDialog.waitForAppInstalled(APP_2_PROVIDER);
            // 4. Close the dialog
            await installAppDialog.clickOnCancelButtonTop();
            await installAppDialog.waitForClosed(2000);
            await studioUtils.saveScreenshot('provider_installed');
            // 5. Verify the apps by their description
            await appBrowsePanel.waitForAppByDescriptionDisplayed(APP_1_DESCRIPTION);
            await appBrowsePanel.waitForAppByDescriptionDisplayed(APP_2_DESCRIPTION);
        });

    it.skip('WHEN An installed application is selected or unselected THEN the toolbar buttons must be updated',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. select the application:
            await appBrowsePanel.clickOnRowByDescription(APP_1_DESCRIPTION);
            await studioUtils.saveScreenshot('chuck_norris_selected');
            // "Uninstall" button gets enabled:
            await appBrowsePanel.waitForUninstallButtonEnabled();
            await appBrowsePanel.waitForStopButtonEnabled();
            await appBrowsePanel.waitForStartButtonDisabled();
            // 2. click on the row again and unselect it:
            await appBrowsePanel.clickOnRowByDescription(APP_1_DESCRIPTION);
            await appBrowsePanel.waitForUninstallButtonDisabled();
            await appBrowsePanel.waitForStopButtonDisabled();
            await appBrowsePanel.waitForStartButtonDisabled()
        });

    it('WHEN The select all checkbox is selected/unselected THEN the rows should be selected/unselected',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Click on 'Select All' checkbox:
            await appBrowsePanel.clickOnSelectAllCheckbox();
            assert.ok(await appBrowsePanel.isRowByIndexChecked(0), 'First row should be selected(blue)');
            assert.ok(await appBrowsePanel.isRowByIndexChecked(1), 'Second row should be selected(blue)');
            // 2. click on 'Select all/Unselect all' checkbox, the checkbox gets unchecked:
            await appBrowsePanel.clickOnSelectAllCheckbox();
            assert.ok(await appBrowsePanel.isRowByIndexChecked(0) === false, 'First row should be unselected');
            assert.ok(await appBrowsePanel.isRowByIndexChecked(1) === false, 'Second row should be unselected');
        });

    it.skip("WHEN Two existing applications have been checked THEN 'Selection Controller' gets partial",
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Select 2 applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(CONTENT_VIEWER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(APP_2_PROVIDER);
            // 2. Verify that Selection Controller checkbox gets partial:
            await appBrowsePanel.isSelectionControllerSelected();
            await appBrowsePanel.waitForSelectionControllerPartial();
        });

    // Verifies issue#145 "Selection Controller remains checked after uninstalling applications."
    it.skip('GIVEN Two existing applications are filtered (Show Selection has been clicked )WHEN both application have uninstalled THEN Selection Toggler get not visible AND Selection checkbox gets unselected',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let uninstallAppDialog = new UninstallAppDialog();
            // 1. Select 2 applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(CONTENT_VIEWER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(APP_2_PROVIDER);
            // 2. Click on 'Show Selections' button:
            await appBrowsePanel.clickOnSelectionToggler();
            // 3. Click on Uninstall button  and confirm:
            await appBrowsePanel.clickOnUninstallButton();
            await uninstallAppDialog.waitForOpened();
            await uninstallAppDialog.clickOnYesButton();
            await appBrowsePanel.waitForNotificationMessage();
            await studioUtils.saveScreenshot('show_selection_issue');
            // 4. Verify that 'Selection Toggler' is not visible:
            await appBrowsePanel.waitForSelectionTogglerNotVisible();
            // 5. Verify that grid is not filtered now:
            await appBrowsePanel.waitForAppByDisplayNameNotDisplayed(CONTENT_VIEWER_APP);
            await appBrowsePanel.waitForAppByDisplayNameNotDisplayed(APP_2_PROVIDER);
            // 6. Verify that initial applications are visible:
            await appBrowsePanel.waitForAppByDisplayNameDisplayed(appConst.TEST_APPLICATIONS.FIRST_APP);
            // 7. Selection Controller checkbox gets not selected:
            await appBrowsePanel.isSelectionControllerSelected();
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});

