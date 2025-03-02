import clsx from 'clsx';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {Text} from '~/components/Text';
import {Link} from '~/components/Link';
import {Button} from '~/components/Button';
import {AddToCartButton} from '~/components/AddToCartButton';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel;
  console.log('🚀 ~ product:', product);

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  return (
    <div className="flex flex-col justify-between w-[267px] h-[575px] bg-white border-2 border-[#ECECEC]">
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="viewport"
      >
        <div className={clsx('flex flex-col w-full gap-2 items-center')}>
          <div className="w-[267px] h-[267px]">
            {image && (
              <Image
                className="w-full h-full"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>
          </div>

          <div className="flex flex-col w-full items-start gap-4 p-4">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis text-black"
              as="h3"
            >
              {product.title}
            </Text>
            <div className="flex gap-4">
              <Text className="flex flex-col text-[#F96352] text-[22px] font-semibold ">
                {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                  <CompareAtPrice
                    className={
                      'opacity-50 line-through text-sm font-normal text-gray-400'
                    }
                    data={compareAtPrice as MoneyV2}
                  />
                )}
                {/* <Money data={price!} /> */}
                <div
                  className={`${
                    !isDiscounted(
                      price as MoneyV2,
                      compareAtPrice as MoneyV2,
                    ) && 'mt-4'
                  }`}
                >
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(price.amount))}
                  <span className="text-black text-sm font-normal">
                    {' '}
                    à vista
                  </span>
                </div>
                <span className="text-black text-sm font-normal">{`ou até 12x de ${(
                  Number(price.amount) / 12
                ).toFixed(2)}`}</span>
              </Text>
            </div>
          </div>
        </div>
      </Link>
      {/* {quickAdd && firstVariant.availableForSale && ( */}
      <AddToCartButton
        lines={[
          {
            quantity: 1,
            merchandiseId: firstVariant.id,
          },
        ]}
        variant="secondary"
        className="bg-[#EB6642] m-4 text-white text-sm h-10 lg:w-[235px] lg:mt-[12px] rounded-full focus:outline-none focus:ring-2"
      >
        <Text as="span" className="flex items-center justify-center gap-2">
          Adicionar
        </Text>
      </AddToCartButton>
      {/* )} */}
      {/* {quickAdd && !firstVariant.availableForSale && (
        <Button variant="secondary" className="mt-2" disabled>
          <Text as="span" className="flex items-center justify-center gap-2">
            Sold out
          </Text>
        </Button>
      )} */}
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
