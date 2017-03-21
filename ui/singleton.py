import logging
__author__ = 'tomas'


class Singleton(object):

    mongo_instance = None
    app_instance = None
    broker_service = None

    def set_mongo_instance(self, mongo_instance):
        self.mongo_instance = mongo_instance

    # Create a class variable that will hold a reference
    # to the single instance of TestSingleton.
    instance = None

    # Define a helper class that will override the __call___
    # method in order to provide a factory method for TestSingleton.

    class SingletonHelper:

        def __call__( self, *args, **kw ):

            # If an instance of TestSingleton does not exist,
            # create one and assign it to TestSingleton.instance.

            if Singleton.instance is None:
                object = Singleton()
                Singleton.instance = object

            # Return TestSingleton.instance, which should contain
            # a reference to the only instance of TestSingleton
            # in the system.

            return Singleton.instance

    # Create a class level method that must be called to
    # get the single instance of TestSingleton.

    getInstance = SingletonHelper()

    # Initialize an instance of the TestSingleton class.
    def __init__( self ) :

        # Optionally, you could go a bit further to guarantee
        # that no one created more than one instance of TestSingleton:

        # if not TestSingleton.instance == None :
        #     raise RuntimeError, 'Only one instance of TestSingleton is allowed!'

        #Continue initialization...
        logging.info("brand new instance")

# Test this implementation of the Singleton pattern.  All of the
# references printed out should have the same address.

# This call should raise a RuntimeError indicating
# that a single instance of TestSingleton already exists.

if __name__ == "__main__":
    for i in range( 10 ):
        Singleton.getInstance()

