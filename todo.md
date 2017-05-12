#index:
   ##implement logoff
   ##implement change pwd
   ##implement register

#workspaces:
    ##pagination -> page combo is wrong [done]
    ##pagination -> selected workspace is lost [done]
    ## show conflict message
    ## edit name

#seed-input:
    ## validate fields before running [done]
    ## feedback when run is click
    ## show progress and allow the user to be redirected to dashboard


#training tab
   ##show progress
   ##make result's  display card horizontal [done]
   ##infinite scrolling or show more results [done]
   ##make fetch button return different results
   ##autocomplete for tags
   ##twitter api
    
#ml-crawling tab
   ##simple crawler
       ###start-stop state of ml-crawling, step 2
       ### validate training dataset
       ### validate keywords

    ##ml crawler
        ##add getModelerProgress for showing the progress on a progress card

        ##add slider with autorefresh!!!

#overall
    ##add feedback:
        ###loading bars
        ###show custom errors

    ## HTTPS!!!

#integration with thh-classifier


>
sitehound_version="3.3.5"
docker run -d -p 0.0.0.0:5082:5081 --name=sitehound-$sitehound_version --hostname=sitehound5082 --link mongodb:mongodb --link kafka-2.11-0.10.1.1-2.4:hh-kafka --link elasticsearch:hh-elasticsearch hyperiongray/sitehound:$sitehound_version
