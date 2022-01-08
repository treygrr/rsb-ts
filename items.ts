import fetch from 'node-fetch';
import fs from 'fs';
const itemCount = 41000;

// create a function that accepts an array and an id as parameters and search the array for the id
const doesItemExist = (arr: any[], id: number): boolean => {
  let match = false;
  for (let i = 0; i < arr.length; i++) {
    Object.keys(arr[i]).forEach((key) => {
      if (match) return;
      if (key.toString() === id.toString()) {
        match = true;
      }
    });
  }
  return match;
};


const save = async (data: Item[]) => {
  const json = JSON.stringify(data);
  fs.writeFileSync(`./src/itemDataBase/${new Date().toLocaleString().replaceAll('/', '-').replaceAll(':', '-').replaceAll(', ', '-').replaceAll(' ', '')}.json`, json);
};

const saveItemFile = async (itemName: string, data: Item, itemId: number) => {
  let fileExists: boolean = false;
  let fileContents: string = '';

  try {
    fileContents = fs.readFileSync(`./src/itemDataBase/items/${itemName}.json`, 'utf8');
    fileExists = true;
  } catch (error) { }

  if (fileExists) {
    try {
      const json = JSON.parse(fileContents);
      if (doesItemExist(json, itemId)) return;
      json.push(data);
      fs.writeFileSync(`./src/itemDataBase/items/${itemName}.json`, JSON.stringify(json));
    } catch (error) {
      console.log('Unable to write file: ', error);
    }
    return;
  }
  try {
    const dataArray = [data];
    fs.writeFileSync(`./src/itemDataBase/items/${itemName}.json`, JSON.stringify(dataArray));
  }
  catch (error) { }
};

const ItemResults: Item[] = [];

interface Item {
  [key: string]: {
    notFound?: boolean,
    icon?: string,
    icon_large?: string,
    id?: number,
    type?: string,
    typeIcon?: string,
    name?: string,
    description?: string,
    current?: {
      trend?: string,
      price?: number
    },
    today?: {
      trend?: string,
      price?: number
    },
    members?: string,
    day30?: {
      trend: string,
      change: string
    },
    day90?: {
      trend?: string,
      change?: string
    },
    day180?: {
      trend?: string,
      change?: string
    }
  }
}

const get = async (itemNumber: number) => {
  let found = true;
  let item: Item = {};
  try {
    const request = await fetch(`https://secure.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${itemNumber}`);
    const data = await request.json();
    item = {
      [itemNumber]: {
        notFound: false,
        icon: data.item.icon,
        icon_large: data.item.icon_large,
        id: data.item.id,
        type: data.item.type,
        typeIcon: data.item.typeIcon,
        name: data.item.name,
        description: data.item.description,
        current: {
          trend: data.item.current.trend,
          price: data.item.current.price
        },
        today: {
          trend: data.item.today.trend,
          price: data.item.today.price
        },
        members: data.item.members,
        day30: {
          trend: data.item.day30.trend,
          change: data.item.day30.change
        },
        day90: {
          trend: data.item.day90.trend,
          change: data.item.day90.change
        },
        day180: {
          trend: data.item.day180.trend,
          change: data.item.day180.change
        }
      }
    };
    saveItemFile(item[itemNumber].name??'', item, itemNumber);
  } catch (error: any) {
    item = {
      [itemNumber]: {
        notFound: false
      }
    };
    ItemResults.push(item);
    saveItemFile(`0-no-results`, item, itemNumber);
    found = false
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  (found) ? console.log(`${itemNumber} - ${item[itemNumber].name}`) : console.log(`${itemNumber} - no results`);

};


for (let i = 5034; i < 5064; i++) {
  await get(i);
}
save(ItemResults);