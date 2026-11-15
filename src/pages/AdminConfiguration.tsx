import { useEffect, useState } from "react";
import { Save, Trash2, Edit3, Settings, Database, Plus } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function AdminConfiguration() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
   const { user,adminToken,initdata } = useAppContext();

   const cleanValue = (val) => {
  if (typeof val !== "string") return val;

  try {
    let fixed = val
      .replace(/`/g, "")
      .trim()
      .replace(/(\w+)\s*:/g, '"$1":') // fix keys
      .replace(/\n/g, "")             // remove new lines
      .replace(/\s+/g, " ");          // normalize spaces

    return JSON.parse(fixed);
  } catch (e) {
    console.log("Invalid config format");
    return val;
  }
};

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/loadConfig");
      const data = await res.json();
      setConfigs(Object.entries(data));
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

const parseValue = (val: string) => {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};
  const saveConfig = async () => {
    await fetch("/api/admin/config", {
    method: "POST",
    headers: {
        "Content-Type": "application/json", // ✅ REQUIRED
        "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
        key,
        value: cleanValue(value)
    })
    });

    setKey("");
    setValue("");
    fetchConfigs();
  };

  const deleteConfig = async (k: string) => {
    if (!confirm(`Are you sure you want to delete ${k}?`)) return;
    await fetch(`/api/admin/config/${k}`, {
      method: "DELETE",
        headers: {
        "Content-Type": "application/json", // ✅ REQUIRED
        "Authorization": `Bearer ${adminToken}`
    },
    });
    fetchConfigs();
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4 md:p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Configuration</h1>
            <p className="text-gray-500 text-sm">Manage global environment variables and JSON schemas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" />
                {key ? "Edit Entry" : "New Config"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. miningPlans"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">JSON Value</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder='{"enabled": true}'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={10}
                  />
                </div>

                <button
                  onClick={saveConfig}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Configuration
                </button>
                
                {key && (
                  <button 
                    onClick={() => {setKey(""); setValue("");}}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database size={18} className="text-gray-400" />
                  Live Configurations
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  {configs.length} Keys
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                   <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : configs.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No configurations found.</div>
                ) : (
                  configs?.map(([k, v]) => (
                    <div key={k} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-indigo-600 truncate mb-1">{k}</p>
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-40">
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        </div>
                        
                        <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setKey(k);
                              setValue(JSON.stringify(v, null, 2));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteConfig(k)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}