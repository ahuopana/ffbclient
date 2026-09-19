# ffbclient
HTML5 ffb client

# Initial Setup

``` git clone https://github.com/christerk/ffbclient.git ```

``` npm install ```

To log into a game directly against `ffb-server` (e.g. the local dev stack),
just enter a coach name and password on the login page.

To use the FUMBBL match list instead, go to https://fumbbl.com/p/oauth to
create OAuth credentials and enter the Client ID/Secret on the login page
(kept in the browser's local storage after that). Alternatively, create
`auth.json` in the root directory (see `auth.json.example`) as a fallback
default when no credentials are entered in the browser.

# Running

``` npm run dev ```

Access app via browser

``` http://localhost:8080  ```

# Execute Tests (jest)

``` npm t ```

Tests can be created in the ```tests``` folder.
