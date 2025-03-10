import { StyleSheet, Text, View } from 'react-native'
import * as React from 'react'
import { getCategoriesByLevelName } from '@/api/questions/categories';

const PracticePart = (level_name : string) => {
    const [categories, setCategories] = React.useState([]);
   
    const getCategoriesByLevelNameFunction = async (level_name : string) => {
        try {
            const response = await getCategoriesByLevelName(level_name);
        } catch (err) {
            console.error(err.message);
        }
        }
    React.useEffect(() => {
        getCategoriesByLevelNameFunction(level_name);
    }, [level_name]);
        
  return (
    <View>
      <Text>PracticePart</Text>
    </View>
  )
}

export default PracticePart

const styles = StyleSheet.create({})