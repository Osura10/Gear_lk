# Fix applied

This project was using React Native packages that are newer than the versions Expo SDK 54 expects. That can cause native/Fabric runtime errors such as:

`TypeError: expected dynamic type 'boolean', but had type 'string'`

Changed versions in `package.json`:

- `@react-native-async-storage/async-storage`: `2.2.0`
- `react-native-gesture-handler`: `~2.28.0`
- `react-native-safe-area-context`: `~5.6.0`
- `react-native-screens`: `~4.16.0`

Also added this at the top of `index.js`:

```js
import 'react-native-gesture-handler';
```

## Run after replacing files

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

Then fully close Expo Go/emulator app and open it again.
