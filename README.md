# webhook

A simple proxy that sends webhooks it recieves to Discord. It takes in a plain `Record<string, string | number | boolean>` like record to make sending simple.

## Simple Request

```bash
curl -X POST -d '{"hello": "world"}' https://your-instance
```

![](https://i.imgur.com/gzEMefc.png)

## Special Fields

Keys that start wth `$` might have a special behaviour, and are all reserved for potential future use so won't show up in your embed.

### `$colour`

```bash
curl -X POST -d '{"$colour": "#f96743"}' https://your-instance
```

![](https://i.imgur.com/yoTYnT7.png)

### `$title`

```bash
curl -X POST -d '{"$title": "Hello World"}' https://your-instance
```

![](https://i.imgur.com/ehxffP1.png)
