export const getQueryParam = () => {
    const queryParameters = new URLSearchParams(window.location.search)
    const lat : any = + queryParameters.get("lat")
    const long: any = + queryParameters.get("long")
    
    if(lat && long) {
        return {
            lat: lat,
            long: long
        }
    } else {
        return null
    }
    
  }

  export const removeViewsParam = () => {
    // Create a new URL object
    let url = new URL(window.location.href);

    // Get the referrer, if there is one
    let ref = url.searchParams.get('views');

    // If there's a referrer...
    if (ref) {

        // store their ID as a cookie
        //document.cookie = `affiliate_id=${ref}; path=/; max-age=${60 * 60 * 24 * 28};`;

        // Remove the query string parameter from the URL
        url.searchParams.delete('views');
        history.replaceState(history.state, '', url.href);
        history.go();
    } else {
        history.go();
    }
  } 