using System.Collections.Concurrent;

namespace DotNet5Pilot.Logic.Utils
{
    public class Cache<Tkey, Tvalue>
    {
        private readonly ConcurrentDictionary<Tkey, Tvalue> values = new();

        public bool TryGet(Tkey key, out Tvalue value)
        {
            return values.TryGetValue(key, out value);
        }

        public Tvalue AddOrGetExisting(Tkey key, Tvalue newValue)
        {
            lock (values)
            {
                if (values.TryGetValue(key, out Tvalue cachedValue))
                {
                    return cachedValue;
                }
                values[key] = newValue;
                return newValue;
            }
        }

        public void Clear()
        {
            lock (values)
            {
                values.Clear();
            }
        }
    }
}
