NEW UI

# Release
 - obfuscate, minimize and join js files

    #FIXME!!!
    # location = "http://" + app.config['ES_HOST'] + ":" + str(app.config['ES_PORT']) + "/" + app.config['ES_INDEX_NAME'] + "/" + app.config['ES_DOC_TYPE']
    location = "http://" + "54.202.36.157"+ ":" + str(app.config['ES_PORT']) + "/" + app.config['ES_INDEX_NAME'] + "/" + app.config['ES_DOC_TYPE']

# ws
 - Redirect when no workspace is selected

#Users:
 - Add change password button on /#users
 - Improve the change password page

#Seeds:
 - accept onions
 - Browse function.
 - check pagination on seeds results.
 - Don't store keywords in master.
 - Don't use endOfPageReached in master, use scrolly on md-content instead.
 - Results> show close icon and delete the results?
 - Results> show refresh icon and re-fetch result?
 - show progress bar on all fetching


#New Deep crawl:
 - Implement button Start Deep crawl
 - Improve alert "select all x"
 - Button to find text on results

#smart-crawler-results
 - Button to find text on results











/************************ deprecated ******************/

#Known Issue:
Import as X always is imported as neutral:

#index:
   ##implement change pwd

#Welcome
    ## generate some content for the / (home) page

#workspaces:
    ## show conflict message
    ## edit name

#seed-input:
    ## feedback when run is click
    ## show progress and
        @by url:
            #show progress

#training tab
   ##show progress
   ##make fetch button return different results
   ##autocomplete for tags
   ##twitter api
    ## repeated results!
    ## show no results when filtered

#ml-crawling tab
   ##simple crawler
       ###start-stop state of ml-crawling, step 2
       ### validate training dataset
       ### validate keywords

    ##ml crawler
        ##add getModelerProgress for showing the progress on a progress card
          ( trainer progress + broadcrawl progress)
        ##add slider with autorefresh!!!

#export!!

#dashboard:

    ##jobs:
    ##training sets by different axis (relevance, page_type, udc)

#overall
    ##add feedback:
        ###loading bars
        ###show custom errors

    ## HTTPS!!!

#integration with thh-classifier











>
sitehound_version="3.3.7"
docker run -d -p 0.0.0.0:5082:5081 --name=sitehound-$sitehound_version --hostname=sitehound5082 --link mongodb:mongodb --link kafka-2.11-0.10.1.1-2.4:hh-kafka --link elasticsearch:hh-elasticsearch hyperiongray/sitehound:$sitehound_version
