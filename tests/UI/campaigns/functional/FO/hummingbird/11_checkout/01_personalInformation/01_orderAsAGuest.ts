// Import utils
import testContext from '@utils/testContext';

// Import common tests
import {enableHummingbird, disableHummingbird} from '@commonTests/BO/design/hummingbird';

// Import pages
import checkoutPage from '@pages/FO/hummingbird/checkout';
import orderConfirmationPage from '@pages/FO/hummingbird/checkout/orderConfirmation';

import {
  dataPaymentMethods,
  FakerAddress,
  FakerCustomer,
  foHummingbirdCartPage,
  foHummingbirdHomePage,
  foHummingbirdProductPage,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_FO_hummingbird_checkout_personalInformation_orderAsAGuest';

/*
Pre-condition:
- Install hummingbird them
Scenario:
- Open FO page
- Add first product to the cart
- Proceed to checkout and validate the cart
- Fill guest personal information
- Complete the order
Post-condition:
- Uninstall hummingbird theme
 */

describe('FO - Checkout - Personal information : Order as a guest', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  const guestData: FakerCustomer = new FakerCustomer({password: ''});
  const secondGuestData: FakerCustomer = new FakerCustomer({password: ''});
  const addressData: FakerAddress = new FakerAddress({country: 'France'});

  // Pre-condition : Install Hummingbird
  enableHummingbird(`${baseContext}_preTest`);

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  describe('Order as a guest', async () => {
    it('should open FO page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'openFO', baseContext);

      // Go to FO and change language
      await foHummingbirdHomePage.goToFo(page);
      await foHummingbirdHomePage.changeLanguage(page, 'en');

      const isHomePage = await foHummingbirdHomePage.isHomePage(page);
      expect(isHomePage, 'Fail to open FO home page').to.eq(true);
    });

    it('should add product to cart', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'addProductToCart', baseContext);

      await foHummingbirdHomePage.goToProductPage(page, 1);
      await foHummingbirdProductPage.addProductToTheCart(page, 1);

      const pageTitle = await foHummingbirdCartPage.getPageTitle(page);
      expect(pageTitle).to.equal(foHummingbirdCartPage.pageTitle);
    });

    it('should proceed to checkout validate the cart', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'validateCart', baseContext);

      await foHummingbirdCartPage.clickOnProceedToCheckout(page);

      const isCheckoutPage = await checkoutPage.isCheckoutPage(page);
      expect(isCheckoutPage).to.equal(true);
    });

    it('should fill guest personal information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'setPersonalInformation', baseContext);

      const isStepPersonalInfoCompleted = await checkoutPage.setGuestPersonalInformation(page, guestData);
      expect(isStepPersonalInfoCompleted, 'Step personal information is not completed').to.equal(true);
    });

    it('should click on edit Personal information and edit the guest information', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkCustomerIdentity', baseContext);

      await checkoutPage.clickOnEditPersonalInformationStep(page);

      const isStepPersonalInfoCompleted = await checkoutPage.setGuestPersonalInformation(page, secondGuestData);
      expect(isStepPersonalInfoCompleted, 'Step personal information is not completed').to.equal(true);
    });

    it('should fill address form and go to delivery step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'setAddressStep', baseContext);

      const isStepAddressComplete = await checkoutPage.setAddress(page, addressData);
      expect(isStepAddressComplete, 'Step Address is not complete').to.equal(true);
    });

    it('should validate the order', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'validateOrder', baseContext);

      // Delivery step - Go to payment step
      const isStepDeliveryComplete = await checkoutPage.goToPaymentStep(page);
      expect(isStepDeliveryComplete, 'Step Address is not complete').to.equal(true);

      // Payment step - Choose payment step
      await checkoutPage.choosePaymentAndOrder(page, dataPaymentMethods.wirePayment.moduleName);
      const cardTitle = await orderConfirmationPage.getOrderConfirmationCardTitle(page);

      // Check the confirmation message
      expect(cardTitle).to.contains(orderConfirmationPage.orderConfirmationCardTitle);
    });
  });

  // Post-condition : Uninstall Hummingbird
  disableHummingbird(`${baseContext}_postTest`);
});