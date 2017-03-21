__author__ = 'tomas'

def perform( fun, *args ):
    fun( *args )

def action1( args ):
    print("action1 run with " + args)

def action2( args ):
    print("action2 run with " + args)


class MyObj:
    myValue = "value1"

    def printVal(self):
        print (self.myValue)

if __name__ == "__main__":

    # perform(action1, "hello")

    myObj1 = MyObj()
    myObj1.printVal()

    myObj2 = MyObj()
    myObj2.myValue = "value2"
    myObj2.printVal()
    myObj1.printVal()
