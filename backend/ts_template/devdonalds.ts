import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
type CookBookTypes = 'recipe' | 'ingredient';

interface cookbookEntry {
  name: string;
  type: CookBookTypes;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface recipeSummary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: (recipe | ingredient)[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  recipeName = recipeName.toLowerCase();
  recipeName = recipeName.replace(/[-_]+/g, ' ');
  recipeName = recipeName.replace(/[^A-Za-z ]+/g, '');
  recipeName = recipeName.replace(/\s+/g,' ').trim();

  if (recipeName.length <= 0) {
    return null;
  }

  let names = recipeName.split(" ");
  names = names.map((name) => name[0].toUpperCase() + name.slice(1));
  recipeName = names.reduce((recipe, currentName) => recipe + ' ' + currentName);
  recipeName = recipeName.trim();

  return recipeName;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  try {
    switch (req.body.type) {
      case 'recipe':
        addRecipe(req.body.name, req.body.requiredItems);
        break;
    
      case 'ingredient':
        addIngredient(req.body.name, req.body.cookTime);
        break;
  
      default:
        return res.status(400).send('Invalid type');
    }

    return res.json({});
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

function addRecipe(name: string, requiredItems: requiredItem[]) {
  checkDuplicateName(name);

  const recipe: recipe = { type: 'recipe', name: name, requiredItems: requiredItems };

  for (let i = 0; i < requiredItems.length; i++) {
    for (let j = i + 1; j < requiredItems.length; j++) {
      if (requiredItems[j].name === requiredItems[i].name) {
        throw new Error('Duplicate item name');
      }
    }
  }

  cookbook.push(recipe);
}

function addIngredient(name: string, cookTime: number) {
  checkDuplicateName(name);

  if (cookTime < 0) {
    throw new Error('Invalid cooktime');
  }

  cookbook.push({type: 'ingredient', name: name, cookTime: cookTime});
}

function checkDuplicateName(name: string) {
  cookbook.forEach((entry) => {
    if (entry.name === name) {
      throw new Error('Duplicate name');
    }
  });
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  try {
    res.json(getRecipeSummary(req.query.name as string));
  } catch (error) {
    res.status(400).send(error.message);
  }
});

function getRecipeSummary(name: string): recipeSummary {
  const recipe = cookbook.find((item) => item.name === name) as recipe;
  if (!recipe) {
    throw new Error(`${name} is not in the cookbook`);
  } else if (recipe.type === 'ingredient') {
    throw new Error(`${name} is an ingredient, not a recipe`);
  }
  
  const summary: recipeSummary = { name: name, cookTime: 0, ingredients: []};

  for (const item of recipe.requiredItems) {
    const itemEntry = cookbook.find((entry) => entry.name === item.name) as ingredient;
    if (!itemEntry) {
      throw new Error(`${item.name} is not in the cookbook`);
    }

    if (itemEntry.type === 'recipe') {
      const itemRecipeSummary = getRecipeSummary(itemEntry.name);

      summary.cookTime += itemRecipeSummary.cookTime * item.quantity;
      const itemIngrediants = itemRecipeSummary.ingredients.map((summaryItem) => 
        ({name: summaryItem.name, quantity: summaryItem.quantity * item.quantity}));
      addRequiredItems(itemIngrediants, summary.ingredients);
      
    } else {
      summary.cookTime += item.quantity * itemEntry.cookTime;
      addRequiredItems([item], summary.ingredients);
    }
  }

  return summary;
}

function addRequiredItems(src: requiredItem[], dest: requiredItem[]) {
  for (const item of src) {
    const destItem = dest.find((destElement) => destElement.name === item.name);
    
    if (!destItem) {
      dest.push(item);
    } else {
      destItem.quantity += item.quantity;
    }
  }
}

app.get('/data', (req, res) => {
  res.json(cookbook);
})

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
