import gc

# Create an object
numbers = [10, 20, 30]

print("Before deleting:", numbers)

# Delete the object
del numbers

# Run garbage collector
gc.collect()

print("Garbage collection completed.")

import sys

num = 100
text = "Python"
data = [1, 2, 3, 4, 5]

print("Memory used by num:", sys.getsizeof(num), "bytes")
print("Memory used by text:", sys.getsizeof(text), "bytes")
print("Memory used by data:", sys.getsizeof(data), "bytes")
