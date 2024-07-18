class MealsApp {
    constructor() {
        this.urladdon_name = "https://www.themealdb.com/api/json/v1/1/search.php?s="
        this.urladdon_id = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="
        this.previousInput = null
        this.mealsData = null
        this.currentInput = null
        this.searchInputElement = document.getElementById("search-input")
        this.mealCardsInMainPage = document.getElementById("meals_cards")
        this.addToFavoriteBody = document.getElementById("add-to-favorite-body")
        this.mealDetailBody = document.getElementById("meal-details-body")

        // using localStrorage for storing the favorite meal list, So even after refreshing/closing the browser it will stay intact.
        let storedFavoriteList = localStorage.getItem("favoritemealsList");
        if (!storedFavoriteList) {
            this.favoritemealsList = []
        }
        else {
            this.favoritemealsList = JSON.parse(storedFavoriteList)
        }
    }

    // function to fetch the requested meal data
    async fetch_data(url) {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error("Server Not Avaliable")
            }
            const data = await response.json()
            return data
        }
        catch (err) {
            console.error(err)
        }
    }

    // Display all the meals in the main page
    display_meals(currentInput, mealsData) {
        const mealList = mealsData.meals

        // If search input is empty, then no meal will be displayed
        if (currentInput === "") {
            this.mealCardsInMainPage.innerText = ""
        }

        // If search input meal cannot be found, then the page will show - No result found result
        else if (mealList == null) {
            this.mealCardsInMainPage.innerText = "Search Result Not Found"
        }

        // If the search input meal is found, then it will display all the meal cards
        else {
            this.mealCardsInMainPage.innerText = ""
            mealList.forEach((meal) => {

                /* image_thumb and recipe btn of each meal card has given mealdetail-body offcanvas as target. Clicking on Img of a meal or recipe button will 
                open the corresponding meal details page*/
                const mealCardContent = `<div class="card custom-card-zoom" id="id_${meal.idMeal}" style="width: 15rem; height: auto">
                                            <img src="${meal.strMealThumb}" class="card-img-top" data-bs-toggle="offcanvas" data-bs-target="#mealDetailsOffCanvas" style="width: 15rem; height: 13rem">
                                            <div class="card-body d-flex flex-column justify-content-around">
                                                <h5 class="card-title text-center">${meal.strMeal}</h5>
                                                <div class="d-flex justify-content-between fst-italic"> 
                                                        <span class="card-text">${meal.strCategory}</span>
                                                        <span class="card-text">${meal.strArea}</span>
                                                </div>  
                                                <div class="d-flex justify-content-between mt-2">  
                                                    <span><a href="#" id="recipe_btn" data-bs-toggle="offcanvas" data-bs-target="#mealDetailsOffCanvas" class="btn btn-danger btn-sm p-1 m-0">Recipe</a></span> 
                                                    <span><input type="checkbox" class="heart-checkbox" id="heart-checkbox"></span> 
                                                </div>
                                            </div>
                                        </div>`
                this.mealCardsInMainPage.insertAdjacentHTML("beforeend", mealCardContent)
            })
        }
    }

    // Calling this function make the Status of meal checked, which are in favoritemealsList
    updateMealCheckedStatus() {
        this.favoritemealsList.forEach((mealid) => {
            const meal = this.mealCardsInMainPage.querySelector(`#${mealid}`)
            if (meal !== null) {
                // Making the Status Checked
                meal.querySelector(".heart-checkbox").checked = true
            }
        })
    }

    // This will add the meal to favorite page when the page is loaded intially using the data stored in localStrorage 
    addMealsToFavorite_IntialPageLoad() {
        this.favoritemealsList.forEach(async (mealid) => {
            const url = this.urladdon_id + mealid.slice(3,)
            // fetching meals data based on meal id
            const mealfetchedData = await this.fetch_data(url)
            this.addMealToFavotites(mealfetchedData.meals)
        })
    }

    // This function will add meals to the addToFavorite Page
    addMealToFavotites(currMealinfo) {
        const favoriteMealContent = `<div id="id_${currMealinfo[0].idMeal}" class="row d-flex align-items-center border">
                                        <div class="col-3" data-bs-toggle="offcanvas" data-bs-target="#mealDetailsOffCanvas" ><img class="img-fluid rounded-start" style="width: 100px"
                                            src=${currMealinfo[0].strMealThumb} alt="mealImg">
                                        </div>
                                        <div class="col-6" data-bs-toggle="offcanvas" data-bs-target="#mealDetailsOffCanvas">
                                            <span>${currMealinfo[0].strMeal}</span>
                                        </div>
                                        <div class="col-3">
                                            <button class="btn btn-danger">remove</button>
                                        </div>
                                    </div>`
        this.addToFavoriteBody.insertAdjacentHTML("afterbegin", favoriteMealContent)

        const currFavoriteMealElement = this.addToFavoriteBody.querySelector(`#id_${currMealinfo[0].idMeal}`)
        const currFavoriteMealRemoveElement = currFavoriteMealElement.querySelector("button")

        // Adding Event Listener to Remove Button, Once you clicked, the corresponding meal will be removed 
        currFavoriteMealRemoveElement.addEventListener("click", () => {

            // removing meal from the Add to Favorite page
            this.addToFavoriteBody.removeChild(currFavoriteMealElement)

            // removing meal_id from the favoritemealsList
            this.favoritemealsList.splice(this.favoritemealsList.indexOf(`id_${currMealinfo[0].idMeal}`), 1);

            // Getting the corresponding meal from the main page if exist
            const meal = this.mealCardsInMainPage.querySelector(`#id_${currMealinfo[0].idMeal}`)

            if (meal !== null) {
                // making the Status unchecked in the main page, if the meal exist in the main page
                meal.querySelector(".heart-checkbox").checked = false
            }

            // udapting the new list in localm storage after removing
            localStorage.setItem("favoritemealsList", JSON.stringify(this.favoritemealsList));
        })

        // Event Listener - To show the meal details page for the corresponding meal in AddToFavorites Page.
        currFavoriteMealElement.addEventListener("click", (e) => {
            this.showMealDetails(currMealinfo)
        })

    }

    addTofavoriteFunctionalityMainPage() {
        // Convert HTMLCollection to an array
        const mealCardList = Array.from(this.mealCardsInMainPage.children);
        mealCardList.forEach((meal) => {
            const heart = meal.querySelector(".heart-checkbox");

            // Adding Event Listener to heart checkbox in each meal.
            heart.addEventListener("change", (e) => {
                if (e.target.checked) {
                    const mealDetails = this.mealsData.meals.filter((item) => `id_${item.idMeal}` === meal.id)

                    // Adds meal to Add to Favotites Page also upadates the favorite meal list
                    this.addMealToFavotites(mealDetails)
                    this.favoritemealsList.push(meal.id)

                    localStorage.setItem("favoritemealsList", JSON.stringify(this.favoritemealsList));

                } else {
                    // Removing the meal from AddtoFavorites page
                    const currFavoriteMealElement = this.addToFavoriteBody.querySelector(`#${meal.id}`)
                    this.addToFavoriteBody.removeChild(currFavoriteMealElement)

                    // Removing meal_id from favoritemealsList and updating in localStorage
                    this.favoritemealsList.splice(this.favoritemealsList.indexOf(meal.id), 1);
                    localStorage.setItem("favoritemealsList", JSON.stringify(this.favoritemealsList));
                }
            })
        })
    }

    showMealDetails(mealDetails) {

        const mealDetailCardElement = this.mealDetailBody.querySelector(".card")
        const mealNameElement = mealDetailCardElement.querySelector("#mealName")
        const mealCategoryElement = mealDetailCardElement.querySelector("#mealCategory")
        const mealAreaElement = mealDetailCardElement.querySelector("#mealArea")
        const mealIngridentsElement = mealDetailCardElement.querySelector("#mealIngridents")
        const watchVediobtnElement = mealDetailCardElement.querySelector("#watchVediobtn")
        const mealPreparationElement = mealDetailCardElement.querySelector("#mealPreparation")
        const mealThumbElement = mealDetailCardElement.querySelector("#mealThumb")
        const mealDetailsHeartElement = mealDetailCardElement.querySelector("#meal-details-heart")

        // Fiiling the content in the meal Details page
        mealDetailCardElement.id = `id_${mealDetails[0].idMeal}`
        mealThumbElement.src = mealDetails[0].strMealThumb
        mealNameElement.textContent = mealDetails[0].strMeal
        mealCategoryElement.innerHTML = `&emsp;Category: ${mealDetails[0].strCategory}`
        mealAreaElement.innerHTML = `&emsp;Area: ${mealDetails[0].strArea}`
        mealPreparationElement.innerHTML = mealDetails[0].strInstructions
        watchVediobtnElement.setAttribute("href", mealDetails[0].strYoutube)

        const ingridentsList = Array.from(mealDetails[0])
        // From the API maximum ingridents/Measures is 20 
        for (let i = 1; i <= 20; i++) {
            if (mealDetails[0][`strIngredient${i}`] === "" || mealDetails[0][`strMeasure${i}`] === "") break
            ingridentsList.push(mealDetails[0][`strIngredient${i}`] + " - " + mealDetails[0][`strMeasure${i}`]) // Adding Ingridents with Measure
        }
        mealIngridentsElement.innerHTML = `<strong>Ingridents: </strong>${ingridentsList.join(", ")}`

        // Intially Making all the mealDetailsHeartElement unchecked, making it checked if it exist in favoritemealsList
        mealDetailsHeartElement.checked = false
        if (this.favoritemealsList.includes(`id_${mealDetails[0].idMeal}`)) {
            mealDetailsHeartElement.checked = true
        }

        const handleChange = async (e) => {
            const mealInMainPage = this.mealCardsInMainPage.querySelector(`#${mealDetailCardElement.id}`)

            let mealDetails = null
            if (e.target.checked) {
                this.favoritemealsList.push(mealDetailCardElement.id);

                // If Meal in Main Page, Clicking heart btn in MealDetails Page also make heart checkbox status checked in the mainPage for the corresponding meal
                if (mealInMainPage !== null) {
                    mealInMainPage.querySelector(".heart-checkbox").checked = true
                    mealDetails = this.mealsData.meals.filter((item) => `id_${item.idMeal}` === mealDetailCardElement.id)
                }
                // If Meal not in Main Page, then Meal details are fetched using the Meal id.
                else {
                    const url = this.urladdon_id + mealDetailCardElement.id.slice(3,)
                    const mealDetails_raw = await this.fetch_data(url)
                    mealDetails = mealDetails_raw.meals
                }

                // Adding Meals to Favorite Page
                this.addMealToFavotites(mealDetails)
                localStorage.setItem("favoritemealsList", JSON.stringify(this.favoritemealsList));

            } else {
                this.favoritemealsList.splice(this.favoritemealsList.indexOf(mealDetailCardElement.id), 1);
                // If Meal Exist in main Page, unchecking the heart in meal Details will uncheck the heart of corresponding meal in main page also
                if (mealInMainPage !== null) {
                    mealInMainPage.querySelector(".heart-checkbox").checked = false
                }

                const currFavoriteMealElement = this.addToFavoriteBody.querySelector(`#${mealDetailCardElement.id}`)
                // Removing meal from favorite page
                this.addToFavoriteBody.removeChild(currFavoriteMealElement)
                localStorage.setItem("favoritemealsList", JSON.stringify(this.favoritemealsList));
            }
        };

        // Ensure the event listener is only attached once
        if (!mealDetailsHeartElement.dataset.listenerAttached) {
            mealDetailsHeartElement.addEventListener("change", handleChange);
            mealDetailsHeartElement.dataset.listenerAttached = true;
        }
    }

    mealDetailsFunctionality() {

        // Convert HTMLCollection to an array
        const mealCardList = Array.from(this.mealCardsInMainPage.children);

        mealCardList.forEach((meal) => {
            const imgthumbElemnt = meal.querySelector("img")
            const recipeBtnElemnt = meal.querySelector("#recipe_btn")

            const mealDetails = this.mealsData.meals.filter((item) => `id_${item.idMeal}` === meal.id)

            // Adding Event Listner to Meal Image_thumb and recipe btn, Once click on these, it will display corresponding meal details page
            imgthumbElemnt.addEventListener("click", () => {
                this.showMealDetails(mealDetails)
            })

            recipeBtnElemnt.addEventListener("click", (e) => {
                this.showMealDetails(mealDetails)
            })
        })
    }

    main() {
        // This will add the meal to favorite page when the page is loaded intially using the data stored in localStrorage 
        this.addMealsToFavorite_IntialPageLoad()

        // Input Search
        this.searchInputElement.addEventListener("input", async () => {
            this.currentInput = this.searchInputElement.value.trim()
            if (this.currentInput === "") {
                this.previousInput = ""
            }
            if (this.currentInput !== this.previousInput) {
                const url = this.urladdon_name + this.currentInput
                this.previousInput = this.currentInput
                this.mealsData = await this.fetch_data(url)
            }

            // Display the page based on the input value
            this.display_meals(this.currentInput, this.mealsData)

            // Adding addTofavorite functionality for each meal in main page
            this.addTofavoriteFunctionalityMainPage()

            // Calling this function make the Status of meal checked, which are in favoritemealsList for every new search input value
            this.updateMealCheckedStatus()

            // Adding MealDetails functionality for each meal in main page
            this.mealDetailsFunctionality()
        })
    }
}

const mealapp = new MealsApp()
mealapp.main()