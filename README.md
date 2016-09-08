# WebVR Spring GPU demo

WebVR farewell card.

See the [demo](http://www.google.com)

## Usage

```sh
$ npm install
$ npm start
```

# Custom text

The text and the colors are passed as a hash.

```
/#text=Bonjour&colors=GSGSGS
```

Where:

- `text` is the text to  be displayed.
- `colors` are the colors, one per letter (Gold, Silver, Gold, Silver, Gold, Silver in the above example).

## Linebreak

To break a line, add `\n` in the text.

```
/#text=Bonjour\nCa Va
```

## Available colors

* Silver, abbrev `S`
* Gold, abbrev `G`

## Available Characters

- `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`, `P`, `Q`, `R`, `S`, `T`, `U`, `V`, `W`, `X`, `Y`, `Z`
- `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`

## Notes

- If `colors` is missing, they will be random.
- This isn't case sensitive, so `HELLO`, `hello` or `HeLlO` are the same.
