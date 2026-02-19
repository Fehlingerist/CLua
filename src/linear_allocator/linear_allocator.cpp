#include "linear_allocator.hpp"
#include <cstdlib>

namespace Util {
    template<typename T>
    size_t LinearAllocator::allocate(size_t size)
    {
        if (memory_region_size < memory_top + size)
        {
            auto new_size = memory_top * 1.5 + size;
            memory_region_start = realloc(memory_region_start,new_size);
            memory_region_size = new_size;
        };

        auto current_index = memory_top;
        memory_top += size;
        return current_index;
    };
};