import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector(state => state.user)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        let result;
        if (!currentCity || currentCity === "null" || currentCity === "All") {
          // ✅ Fetch ALL shops when "All" is selected or no city set
          result = await axios.get(`${serverUrl}/api/shop/get-all`, { withCredentials: true })
        } else {
          result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, { withCredentials: true })
        }
        dispatch(setShopsInMyCity(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchShops()
  }, [currentCity])
}

export default useGetShopByCity