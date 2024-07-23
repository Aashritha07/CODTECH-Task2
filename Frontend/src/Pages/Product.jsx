import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Contexts/ShopContext';
import Breadcums from '../Components/Breadcums/Breadcums';
import Productdisplay from '../Components/ProductDisplay/Productdisplay';

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <Breadcums product={product} />
      <Productdisplay product={product}/>
    </div>
  );
};

export default Product;
