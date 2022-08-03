const mealsElem = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoElem = document.getElementById("meal-info");
const closePopupBtn = document.getElementById("close-popup");
const searchMeal = document.getElementById("search-meal");
const searchButton = document.getElementById("search-button");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal(){
   const resp =await fetch("https://www.themealdb.com/api/json/v1/1/random.php"
   );
   const respData = await resp.json();
   const randomMeal = respData.meals[0];

   addMeal(randomMeal,true);
}
async function getMealById(id){
    const resp =  await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
   const respData = await resp.json();
   const meal = respData.meals[0];

   return meal;
}
async function getMealSBySearch(term){
    const resp =await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term);
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) { 

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random
                    ? `
            <span class="random"> Random Recipe </span>`
                    : ""
            }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    const btn = meal.querySelector(".meal-body .fav-btn");
    btn.addEventListener("click",()=>{
        if(btn.classList.contains("active"))
        {
            removeMealFromLS(mealData.idMeal);
            btn.classList.remove("active");
        }else{
            addMealToLS(mealData.idMeal);
            btn.classList.add("active"); 
        }
        fetchFavMeals();
    });

    meal.addEventListener("click",() =>{
        showMealInfo(mealData);

    });
    mealsElem.appendChild(meal);
}

function addMealToLS(mealId) {
    const mealIds = getMealFromLS();
    localStorage.setItem('mealIds',JSON.stringify([...mealIds,mealId]));
}

function removeMealFromLS(mealId){
    const mealIds = getMealFromLS();
    localStorage.setItem("mealIds",JSON.stringify(mealIds.filter((id) => id !== mealId)));

}

function getMealFromLS(){
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
     //cleaning the container
    favoriteContainer.innerHTML = "";
    const mealIds = getMealFromLS();

    const meals = [];
     
    for(let i=0;i<mealIds.length;i++){
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
         addMealToFav(meal);
    }
}

function addMealToFav(mealData) { 

    const favMeal = document.createElement("li");



    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
    <button class="clear"><i class = "fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");
    btn.addEventListener("click",() =>{
      removeMealFromLS(mealData.idMeal);  
      fetchFavMeals();
    });

    favMeal.addEventListener("click",()=>{
        showMealInfo(mealData);

    });
    
    favoriteContainer.appendChild(favMeal);
}   

function showMealInfo(mealData){
//cleaning it
     mealInfoElem.innerHTML = '';
    //updating the meal info
    const mealsElem = document.createElement("div");

    //getting ingredients
    const ingredients = [];
    for(let i=1;i<=20;i++){
        if(mealData['strIngredient'+i]){
            ingredients.push(`${mealData["strIngredient"+i]}-${mealData["strMeasure"+i]}`);

        }else{
            break;
        }

    }



    mealsElem.innerHTML = `
    <h1>${mealData.strMeal}</h1>
                <img src="${mealData.strMealThumb}" alt="${mealData.strMealThumb}"/>
                <p>${mealData.strInstructions}</p>
                <h3>Ingredients ::</h3>
                <ul>
                ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}

                </ul>
    `
    mealInfoElem.appendChild(mealsElem);
    //show the popup
    mealPopup.classList.remove('hidden');


}



searchButton.addEventListener('click',async()=>{
    // cleaning the container
    mealsElem.innerHTML = '';
    const search = searchMeal.value;
    const meals = await getMealSBySearch(search);

   if(meals){ meals.forEach((meal) =>{
        addMeal(meal);
    });
   }
   
}); 

closePopupBtn.addEventListener('click',()=>{
    mealPopup.classList.add("hidden");

});