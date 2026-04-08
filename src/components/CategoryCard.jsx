import React from 'react'

function CategoryCard({name,image,onClick}) {
  return (
    <div className='w-[100px] h-[130px] md:w-[144px] md:h-[180px] shrink-0 cursor-pointer flex flex-col items-center justify-start group' onClick={onClick}>
       <div className='w-[100px] h-[100px] md:w-[144px] md:h-[144px] rounded-full overflow-hidden mb-2 relative'>
           <img src={image} alt={name} className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105' />
       </div>
       <div className='text-center text-sm font-semibold text-gray-800 mt-2 truncate w-[90%]'>{name}</div>
    </div>
  )
}

export default CategoryCard
