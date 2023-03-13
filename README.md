# Weather Meme
Should I go out today?

You can see a demo on <https://weather.abundzu.org>

[<img src="/images/screenshot_ani.gif" width="533"/>](/images/screenshot_ani.gif)


------------

## Dependency Support

- OpenWeather API: https://openweathermap.org/api
- ipInfo API: https://ipinfo.io
- YesNo API: https://yesno.wtf/#api
- Leaflet JS library: https://leafletjs.com

## How to start

### Setup
1. Clone the repo: `git clone git@github.com:whydesign/weather_meme.git`
2. create an `env.json` in the project root directory
3. Add your own OpenWeather and ipInfo API Key like this:

```json
{
  "owmApiKey": "XXXXXXXXX",  // Your OpenWeather API Key
  "ipApiKey": "XXXXXXXXX"    // Your ipInfo API Key
}
```
    
### Get your own API Keys

- OpenWeather API: Sign up for free on <https://openweathermap.org/api>
- ipInfo API: Sign up for free on <https://ipinfo.io>
    - I use the ipInfo API as fallback, if the user denied the Geolocation
    - Read more on <https://developer.mozilla.org/en-US/docs/Web/API/Navigator/geolocation>
