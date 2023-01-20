import React from 'react'
import Select from 'react-select';

interface ShippingOptionProps {
    express: number;
    regular: number;
    setShipping: (shipping: number) => void;
    shipping: number;
}

const ShippingOption: React.FC<ShippingOptionProps> = ({express, regular, shipping, setShipping}) => {

  return (
    <div className="flex items-center justify-between border-b-2 px-6 py-12">
      <p className="text-xl text-gray-400">Delivery</p>
          <Select 
              className='w-1/2'
              options={[
                  { value: regular, label: `Regular: $${regular}` },
                  { value: express, label: `Express: $${express}` },
              ]}
        defaultValue={{ value: shipping, label: `Regular: $${regular}` }}
              onChange={(e:any) => setShipping(e.value)}
          />
          
    </div>
  );
};

export default ShippingOption