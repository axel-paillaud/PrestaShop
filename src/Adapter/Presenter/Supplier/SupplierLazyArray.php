<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace PrestaShop\PrestaShop\Adapter\Presenter\Supplier;

use Language;
use Link;
use PrestaShop\PrestaShop\Adapter\Image\ImageRetriever;
use PrestaShop\PrestaShop\Adapter\Presenter\AbstractLazyArray;
use PrestaShop\PrestaShop\Adapter\Presenter\LazyArrayAttribute;
use Supplier;

class SupplierLazyArray extends AbstractLazyArray
{
    /**
     * @var ImageRetriever
     */
    private $imageRetriever;

    /**
     * @var Link
     */
    private $link;

    /**
     * @var array
     */
    protected $supplier;

    /**
     * @var Language
     */
    private $language;

    public function __construct(
        array $supplier,
        Language $language,
        ImageRetriever $imageRetriever,
        Link $link
    ) {
        $this->supplier = $supplier;
        $this->language = $language;
        $this->imageRetriever = $imageRetriever;
        $this->link = $link;

        parent::__construct();
        $this->appendArray($this->supplier);
    }

    /**
     * @return string
     */
    #[LazyArrayAttribute(arrayAccess: true)]
    public function getUrl()
    {
        return $this->link->getSupplierLink($this->supplier['id']);
    }

    /**
     * @return array|null
     */
    #[LazyArrayAttribute(arrayAccess: true)]
    public function getImage()
    {
        return $this->imageRetriever->getImage(
            new Supplier($this->supplier['id'], $this->language->getId()),
            $this->supplier['id']
        );
    }

    /**
     * @return int
     */
    #[LazyArrayAttribute(arrayAccess: true)]
    public function getNbProducts()
    {
        if (!isset($this->supplier['nb_products'])) {
            $this->supplier['nb_products'] = count(
                (new Supplier($this->supplier['id'], $this->language->getId()))
                    ->getProductsLite($this->language->getId())
            );
        }

        return $this->supplier['nb_products'];
    }
}