import React, {useEffect , useReducer, useState } from 'react';
import Navbar from '../../../shared/components/Client/user-NAV';
import MainLayout from "../../../shared/components/admin/Layout/MainLayout";
import confirmationIcon from '../../../public/confirmationIcon.svg';
import Image from 'next/image';
import {GetBasket, AddOrder} from '../../../shared/services/index';
import {useMutation, useQuery, useQueryClient} from 'react-query'
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/redux/store';
import Loading from '../../../shared/components/Loading/Loading';
import EmptyBasket from '../../../shared/components/Client/EmptyBasket';
import { useRouter } from 'next/router';
import { OrderPostDataType } from '../../../shared/interfaces';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { useToast } from '@chakra-ui/react'
import styles from "../basket/basket.module.css";
import {useTranslation} from "next-i18next";
import withClientAuth from "../../../shared/HOC/withClienAuth";
import {useResize} from "../../../shared/hooks/useResize";


const initialState = {
    address: '',
    phoneNumber: '+994',
    error: '',
    formatMessage: '',
    errorNumber: '',
    formatNumber: '',
}


type OrderState = {
    id: string,
    created: number | string,
    delivery_address: string | number,
    contact: number,
    payment_method: string
}

type BasketProps = {
    productCount?: number;
    data_list?: string[],
    size: string
}


const reducer = (state:any, action:any) => {
    switch (action.type) {
        case "SET_ADDRESS":
            return { ...state, address: action.payload };
        case "SET_PHONE_NUMBER":
            return { ...state, phoneNumber: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_FORMAT_MESSAGE":
            return { ...state, formatMessage: action.payload };
        case "SET_ERROR_NUMBER":
            return { ...state, errorNumber: action.payload };
        case "SET_FORMAT_NUMBER":
            return { ...state, formatNumber: action.payload };

        default:
            return state;
    }
}

const addressRegex = /^[a-zA-Z0-9\s,'-]*$/;
const azerbaijanPhoneRegex = /^\+994-(50|51|55|60|70|77|99)-\d{3}-\d{2}-\d{2}$/;

const formatPhoneNumber = (value:any) => {
    const digits = value.replace(/[^\d]/g, '').substring(3);
    let formatted = '+994';

    if (digits.length > 2) {
        formatted += '-' + digits.substring(0, 2);
    } else {
        formatted += '-' + digits;
    }
    if (digits.length > 5) {
        formatted += '-' + digits.substring(2, 5);
    } else if (digits.length > 2) {
        formatted += '-' + digits.substring(2);
    }
    if (digits.length > 7) {
        formatted += '-' + digits.substring(5, 7);
    } else if (digits.length > 5) {
        formatted += '-' + digits.substring(5);
    }
    if (digits.length > 9) {
        formatted += '-' + digits.substring(7, 9);
    } else if (digits.length > 7) {
        formatted += '-' + digits.substring(7);
    }

    return formatted;
};




function Checkout() {
    let { isMobile } = useResize();
    const toast = useToast()
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isRectVisible, setIsRectVisible] = useState(false);
    const [isRectVisible2, setIsRectVisible2] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [inputVal, setInputVal] = useState(false)
    const [inputPhoneNumber, setInputPhoneNumbe] = useState(false)
    const [phoneNumRegex, setPhoneNumRegex] = useState(false)
    const [addressValid, setAddressValid] = useState(false);
    const [userLoaded, setUserLoaded] = useState(false);
    const { t } = useTranslation("common");


   
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    // let user =typeof window !== 'undefined' ? window.localStorage.getItem('user_info') : null
    const queryClient = useQueryClient();
    

    


    const { data: basket_List, isLoading: basket_Loading, error: basket_Error, status: basket_Status } = useQuery('basket', GetBasket, {
        enabled: userLoaded,
      });
    const basketList = basket_List?.data.result.data;
    useEffect(() => {
        if (user) {
            setUserLoaded(true);
        }
    }, [user]);
    
    
    useEffect(() => {
        setInputVal(state.address.length > 0);
    }, [state.address]);
    
    useEffect(() => {
        setInputPhoneNumbe(state.phoneNumber.length > 5);
    }, [state.phoneNumber]);
    
    useEffect(() => {
        setPhoneNumRegex(azerbaijanPhoneRegex.test(state.phoneNumber));
    }, [state.phoneNumber]);
    
    useEffect(() => {
        setAddressValid(addressRegex.test(state.address));
    }, [state.address]);

   const mutation = useMutation((orderBasket:any) => AddOrder(orderBasket),
   {
    onSuccess: () => {
        queryClient.invalidateQueries('order');
        toast({
            title: `You ordered successfully`,
            status: 'success',
            duration: 2000,
            isClosable: true,
            position:'top-right',
            variant:'subtle'
        })
    },
    onError: (error) => {
        console.log("Error add product", error);
        toast({
            title: `Product deleted successfully!`,
            status: 'success',
            duration: 2000,
            isClosable: true,
            position:'top-right',
            variant:'subtle'
        })
      },
   }
);



const handleCheckout = () => {const orderBasket: OrderPostDataType = {
    user_id: user?.id,
    basket_id: basketList.id,
    delivery_address: state.address,
    contact: state.phoneNumber,
    payment_method: isRectVisible ? "2" : "1",
    created: Date.now() 

};
if(user) {
    mutation.mutate(orderBasket);
    setCheckoutComplete(true);


    setTimeout(() => {
        router.push('/user/orders');
    }, 2000);
} else {
    // toast.error("User not logged in.");
    toast({
        title: `User not logged in.`,
        status: 'error',
        duration: 2000,
        isClosable: true,
        position:'top-right',
        variant:'subtle'
    })
}

};

    const handleToggle = () => {
        setIsRectVisible2(true);
        setIsRectVisible(false);
    };

    const handleToggle2 = () => {
        setIsRectVisible(true);
        setIsRectVisible2(false);
    };

  




    const handleChange = (e:any) => {
        const value = e.target.value;
        dispatch({ type: "SET_ADDRESS", payload: value });

        if (!addressRegex.test(value)) {
            dispatch({ type: "SET_ERROR", payload: "Yanlış adres formatı!" });
            dispatch({ type: "SET_FORMAT_MESSAGE", payload: "Örnək format: Ataturk Ganclik Baku 45" });
      

        } else {
            dispatch({ type: "SET_ERROR", payload: '' });
            dispatch({ type: "SET_FORMAT_MESSAGE", payload: '' });
        }

    }
    

    const handleChange1 = (event:any) => {
        let value = event.target.value;

        if (!value.startsWith('+994')) {
            value = '+994' + value.replace(/^\+994/, '');
        }

        const formattedValue = formatPhoneNumber(value);

        dispatch({ type: 'SET_PHONE_NUMBER', payload: formattedValue });

        if (formattedValue === '+994' || formattedValue === '+994-' || azerbaijanPhoneRegex.test(formattedValue)) {
            dispatch({ type: "SET_ERROR_NUMBER", payload: '' });
            dispatch({ type: "SET_FORMAT_NUMBER", payload: '' });
        } else {
            dispatch({ type: "SET_ERROR_NUMBER", payload: "Azerbaycan nömresi girməlisiz!" });
            dispatch({ type: "SET_FORMAT_NUMBER", payload: "Örnək: +994-55-555-55-55" });
        }
    };






    return (
        <>
        
            <MainLayout>
                <div className='px-8 pt-1 pb-[100px]'>
                    <div className='flex flex-row'>
                        {!isMobile &&
                        <div className="w-1/4">
                            <Navbar active={4} />
                        </div>}
                        <div className="lg:w-3/4 w-full  lg:p-[16px] pe-[0px]">
                            {checkoutComplete ? (
                                <div className='w-10/12 flex justify-center items-center flex-col w-full h-full gap-4 rounded-md bg-cardColor bg-rounded-md shadow-md'>
                                    <div className=' flex justify-center mt-20'>
                                        <Image src={confirmationIcon}alt=''/>
                                    </div>
                                    <h1 className='flex justify-center text-2xl font-bold text-grayText2'>Your order has been</h1>
                                    <h1 className='flex justify-center text-2xl font-bold text-grayText2'>received</h1>
                                </div>
                            ) : (
                                
                                <>
                                  {basket_Loading ? (
                  <Loading />
                ) : (
                  <>
                    {basketList?.items?.length > 0 ? (
                      <div className="flex gap-5 justify-between lg:flex-row flex-col-reverse">
                        <div className='lg:w-8/12 w-full  mt-5 bg-cardColor p-4 bg-rounded-md shadow-md'>
                          <h1 className='text-grayText2 text-2xl font-bold mt-6 ml-6'>{t("Checkout")}</h1>

                          <div className=' mt-6 ml-6'>
                            <label className='text-grayText2 font-bold'>{t("Delivery Address")}</label>
                            <input
                              type="text"
                              id="address"
                              name="address"
                              value={state.address}
                              onChange={handleChange}
                              required
                              className='w-11/12 h-14 p-5 rounded-md'
                              placeholder='Ataturk Ganclik Baku 45'
                            />
                          </div>
                          {state.error && <span className='text-mainRed'>{state.error}</span>}
                          <br />
                          {state.formatMessage && <span className=' text-green'>{state.formatMessage}</span>}

                          <label className='text-grayText2 font-bold ml-6'>{t("Contact Number")}</label>
                          <div className='ml-6'>
                            <input
                              type="text"
                              id="phoneNumber"
                              name="number"
                              value={state.phoneNumber}
                              onChange={handleChange1}
                              required
                              className='w-11/12 h-14 p-5 rounded-md'
                              placeholder='+994'
                            />
                          </div>

                          {state.errorNumber && <span className=' text-mainRed'>{state.errorNumber}</span>}
                          <br />
                          {state.formatNumber && <span className=' text-green'>{state.formatNumber}</span>}

                          <h1 className='ml-6 font-bold text-grayText2 '>   {t("Payment Method")}</h1>

                          <div className="flex ml-6 mt-4">
                            <button onClick={handleToggle}>
                              <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.5" y="0.5" width="29" height="29" rx="14.5"
                                  fill="white" stroke="#6FCF97" />
                                {isRectVisible2 &&
                                  <rect x="8" y="8" width="15" height="15" rx="7.5"
                                    fill="#6FCF97" />}
                              </svg>
                            </button>
                            <h1 className={`ml-2 ${isRectVisible2 ? 'text-textColorGreen' : ''}`}>  {t("Pay at the door")}</h1>
                          

                            <button className=' ml-16' onClick={handleToggle2}>
                              <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.5" y="0.5" width="29" height="29" rx="14.5"
                                  fill="white" stroke="#6FCF97" />
                                {isRectVisible &&
                                  <rect x="8" y="8" width="15" height="15" rx="7.5"
                                    fill="#6FCF97" />}
                              </svg>
                            </button>
                            <h1 className={`ml-2 ${isRectVisible ? 'text-textColorGreen' : ''}`}>{t("By Credit Card")}</h1>
                          </div>

                          <div className='flex items-center justify-center mt-16'>
                            <button
                              className={`w-11/12 h-11 ${(isRectVisible || isRectVisible2) && basketList?.items?.length > 0 && inputVal && inputPhoneNumber && phoneNumRegex && addressValid ? 'bg-textColorGreen' : 'bg-overlayColorGreen'} text-white rounded-sm`}
                              onClick={handleCheckout}
                              disabled={!((isRectVisible || isRectVisible2) && inputVal && inputPhoneNumber && phoneNumRegex && addressValid && basketList?.items?.length > 0)}
                            >
                              Checkout
                            </button>
                          </div>
                        </div>

                        <div className='lg:w-4/12 w-full h-5/6 mt-5 bg-cardColor rounded-md shadow-md'>
                          <h1 className='flex justify-center text-grayText font-bold mt-5 text-xl'>{t("Your Order")}</h1>
                          {basketList.items.map((product:any, index: any) => (
                            <div key={index} className='flex p-2 justify-between'>
                                <div className='flex gap-2'>
                                    <h1 className='font-bold text-2xl text-grayText'>{product.count}x</h1>
                                    <span className='text-grayText mt-1 text-lg'>{product.name}</span>
                                </div>
                              {/*<div className='flex gap-16 ml-2'>*/}
                                <h5 className='mt-1.5 text-lg text-grayText'>{product.price} ₼</h5>
                              {/*</div>*/}
                            </div>
                          ))}
                          <hr className=' mt-8 w-11/12' />
                          <div className='flex gap-48 mt-4 justify-between p-2'>
                            <h1 className='font-bold text-2xl text-grayText'>{t("Total")}</h1>
                            <h5 className='mt-1 text-xl text-grayText'>{basketList.total_amount} ₼</h5>
                          </div>
                          
                          <h1 className=' mt-7'></h1>
                        </div>
                      </div>
                    ) : (
                        <div className={`${styles.user_cabinet_box} ${styles.md}`}>
                         <EmptyBasket />
                        </div>
                    )}
                  </>
                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </>
    );
}

export default withClientAuth(Checkout);



export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
      ...(await serverSideTranslations(locale as string, ["common"])),
  },
});
