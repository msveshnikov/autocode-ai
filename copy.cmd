@echo off

REM Export users collection
ssh -l ubuntu allchat.online "docker exec autocode_mongo_1 mongoexport --db autocode --type csv --collection users --fields _id,email,subscriptionStatus,stripeSubscriptionId,stripeCustomerId,ip,devices,tier,dailyRequests,tierExpiration >users.csv"

REM Export inquiries collection
ssh -l ubuntu allchat.online "docker exec autocode_mongo_1 mongoexport --db autocode --type csv --collection inquiries --fields _id,email,name,message,status >inquiries.csv"

REM Export codes collection
ssh -l ubuntu allchat.online "docker exec autocode_mongo_1 mongoexport --db autocode --type csv --collection codes --fields _id,code,isRedeemed,redeemedBy,redeemedAt >codes.csv"

REM Copy exported files to local machine
scp ubuntu@allchat.online:/home/ubuntu/users.csv .
scp ubuntu@allchat.online:/home/ubuntu/inquiries.csv .
scp ubuntu@allchat.online:/home/ubuntu/codes.csv .

