# EasyFinance.co, manage your finances in one place.
### Node+Express+Mysql+PassportJs
[![Nodejs](https://www.vectorlogo.zone/logos/nodejs/nodejs-card.png)](https://nodejs.org/en/)

# Running
In order to run this application you'll need to use nodejs v8.11.1 and install the required packages.

```bash
user@pc ~$ git clone https://github.com/h3ct0rjs/EasyFinance
user@pc ~$ cd api
user@pc ~/api$ npm install
```

## Development Server
This option will use an application called nodemon, it will let you restart the server each time you need or it will update the service each time a new file is added to the project folder.

```bash
user@pc ~/api$ npm run start
```

You should see something like :

```bash
┌[c1b3r☮fsociety]-(~/Documents/Developer/Js/modelsgame/apigames)-[git://master ✗]-
└> npm run devstart

> apigames@0.0.0 devstart /home/c1b3r/Documents/Developer/Js/modelsgame/apigames
> nodemon ./bin/www
[nodemon] 1.17.3
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node ./bin/www`
```

press **rs** to restart the server in the console.

## Production Server

This option will use an application load balancer call pm2, it will allow you to create an instance in the 8000 port running on localhost, ready to use a proxy server like nginx :love:

```bash
user@pc ~/api$ npm run prod
```

You should something like this :

```bash
> apigames@0.0.0 prod /home/c1b3r/Documents/Developer/Js/modelsgame/apigames
> pm2 start ./bin/www --name 'Api'

[PM2] Starting /home/c1b3r/Documents/Developer/Js/modelsgame/apigames/bin/www in fork_mode (1 instance)
[PM2] Done.
┌──────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬───────┬──────────┐
│ App name │ id │ mode │ pid   │ status │ restart │ uptime │ cpu │ mem       │ user  │ watching │
├──────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼───────┼──────────┤
│ easy     │ 0  │ fork │ 32746 │ online │ 0       │ 0s     │ 0%  │ 20.0 MB   │ c1b3r │ disabled │
└──────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴───────┴──────────┘
```

## Routes and EndPoints
We use clean urls to create a standar site : 
Available urls :
```
www.easyf.co/
www.easyf.co/about/                  
www.easyf.co/users/                  
www.easyf.co/users/login/              
www.easyf.co/users/signup/             
www.easyf.co/users/dashboard/          
www.easyf.co/users/dashboard/profile/   
www.easyf.co/users/dashboard/settings
www.easyf.co/users/dashboard/accounts/  
www.easyf.co/users/dashboard/accounts/savings 
www.easyf.co/users/dashboard/accounts/current 
www.easyf.co/users/dashboard/accounts/loan    
www.easyf.co/users/dashboard/analitics/ 
www.easyf.co/users/dashboard/investments
www.easyf.co/users/dashboard/budgets/   
www.easyf.co/users/dashboard/cryptomoney
```

## Testing

In order to test this restful api you will need to use postman preferibly or curl if you got the unix skills.

## Getting Help

Contact with the developers via email address

[clean urls]: https://en.wikipedia.org/wiki/Clean_URL
[json]: https://www.json.org/

### About

Coded by

* Hector F. Jimenez S. , hfjimenez@utp.edu.co
* Sebastian Zapata  , sebastzr@utp.edu.co
* Kevin Moreno , kevinmorenor@utp.edu.co


## License
---

**MIT**

