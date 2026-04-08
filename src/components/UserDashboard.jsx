import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const {currentCity,shopInMyCity,itemsInMyCity,searchItems}=useSelector(state=>state.user)
  const cateScrollRef=useRef()
  const shopScrollRef=useRef()
  const navigate=useNavigate()
  const [showLeftCateButton,setShowLeftCateButton]=useState(false)
  const [showRightCateButton,setShowRightCateButton]=useState(false)
   const [showLeftShopButton,setShowLeftShopButton]=useState(false)
  const [showRightShopButton,setShowRightShopButton]=useState(false)
  const [updatedItemsList,setUpdatedItemsList]=useState([])

const handleFilterByCategory=(category)=>{
if(category=="All"){
  setUpdatedItemsList(itemsInMyCity)
}else{
  const filteredList=itemsInMyCity?.filter(i=>i.category===category)
  setUpdatedItemsList(filteredList)
}

}

useEffect(()=>{
setUpdatedItemsList(itemsInMyCity)
},[itemsInMyCity])


  const updateButton=(ref,setLeftButton,setRightButton)=>{
const element=ref.current
if(element){
setLeftButton(element.scrollLeft>0)
setRightButton(element.scrollLeft+element.clientWidth<element.scrollWidth)

}
  }
  const scrollHandler=(ref,direction)=>{
    if(ref.current){
      ref.current.scrollBy({
        left:direction=="left"?-200:200,
        behavior:"smooth"
      })
    }
  }




  useEffect(()=>{
    if(cateScrollRef.current){
      updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll',()=>{
        updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener('scroll',()=>{
         updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      })
     
    }

    return ()=>{cateScrollRef?.current?.removeEventListener("scroll",()=>{
        updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      })
         shopScrollRef?.current?.removeEventListener("scroll",()=>{
        updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      })}

  },[categories])


  return (
    <div className='w-full flex flex-col gap-8 items-center'>
      <Nav />

      {searchItems !== null ? (
        <div className="w-full max-w-7xl flex flex-col gap-6 items-start px-4 sm:px-8 mt-2">
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-bold border-b border-gray-200 pb-3 w-full'>
            Search Results
          </h1>
          {searchItems.length === 0 ? (
            <div className='w-full text-center text-gray-500 py-16 text-xl font-medium'>
              No results found 🔍
            </div>
          ) : (
            Object.values(searchItems.reduce((acc, item) => {
              const shopId = item.shop._id;
              if (!acc[shopId]) {
                acc[shopId] = { shop: item.shop, items: [] };
              }
              acc[shopId].items.push(item);
              return acc;
            }, {})).map(group => (
              <div key={group.shop._id} className="w-full mb-6 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-orange-50/50 p-5 border-b border-orange-100 gap-4">
                  <div className="flex items-center gap-4">
                    <img src={group.shop.image} alt={group.shop.shopName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm border-2 border-white" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800 hover:text-[#fc8019] cursor-pointer transition-colors" onClick={() => navigate(`/shop/${group.shop._id}`)}>
                        {group.shop.shopName}
                      </h2>
                      <p className="text-sm text-gray-500 font-medium">📍 {group.shop.city} • {group.items.length} items matches query</p>
                    </div>
                  </div>
                  <button 
                    className="w-full sm:w-auto bg-[#fc8019] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#e47317] hover:shadow-lg transition-all whitespace-nowrap"
                    onClick={() => navigate(`/shop/${group.shop._id}`)}
                  >
                    View Restaurant &rarr;
                  </button>
                </div>
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6'>
                  {group.items.map((item) => (
                    <FoodCard data={item} key={item._id}/>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="w-full max-w-7xl flex flex-col gap-5 items-start px-4 sm:px-8 mt-2">
            <h1 className='text-gray-800 text-2xl sm:text-3xl font-bold'>Inspiration for your first order</h1>
            <div className='w-full relative'>
              {showLeftCateButton &&  <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#fc8019] text-white p-2 text-xl rounded-full shadow-lg hover:bg-[#e47317] z-10 transition-colors' onClick={()=>scrollHandler(cateScrollRef,"left")}><FaCircleChevronLeft /></button>}
              <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={cateScrollRef}>
                {categories.map((cate, index) => (
                  <CategoryCard name={cate.category} image={cate.image} key={index} onClick={()=>handleFilterByCategory(cate.category)}/>
                ))}
              </div>
              {showRightCateButton &&  <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#fc8019] text-white p-2 text-xl rounded-full shadow-lg hover:bg-[#e47317] z-10 transition-colors' onClick={()=>scrollHandler(cateScrollRef,"right")}><FaCircleChevronRight /></button>}
            </div>
          </div>

          <div className='w-full max-w-7xl flex flex-col gap-5 items-start px-4 sm:px-8 border-t border-gray-100 pt-8 mt-2'>
            <h1 className='text-gray-800 text-2xl sm:text-3xl font-bold'>Best Shop in {currentCity}</h1>
            <div className='w-full relative'>
              {showLeftShopButton &&  <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#fc8019] text-white p-2 text-xl rounded-full shadow-lg hover:bg-[#e47317] z-10 transition-colors' onClick={()=>scrollHandler(shopScrollRef,"left")}><FaCircleChevronLeft /></button>}
              <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={shopScrollRef}>
                {shopInMyCity?.map((shop, index) => (
                  <CategoryCard name={shop.shopName} image={shop.image} key={index} onClick={()=>navigate(`/shop/${shop._id}`)}/>
                ))}
              </div>
              {showRightShopButton &&  <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#fc8019] text-white p-2 text-xl rounded-full shadow-lg hover:bg-[#e47317] z-10 transition-colors' onClick={()=>scrollHandler(shopScrollRef,"right")}><FaCircleChevronRight /></button>}
            </div>
          </div>

          <div className='w-full max-w-7xl flex flex-col gap-5 items-start px-4 sm:px-8 border-t border-gray-100 pt-8 mt-2 mb-16'>
            <h1 className='text-gray-800 text-2xl sm:text-3xl font-bold'>Suggested Food Items</h1>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8'>
              {updatedItemsList?.map((item,index)=>(
                <FoodCard key={index} data={item}/>
              ))}
            </div>
          </div>
        </>
      )}


    </div>
  )
}

export default UserDashboard