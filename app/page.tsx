"use client";

import { useEffect, useState } from "react";

interface Sensor {
  id: string;
  type: "NODE1" | "NODE2" | "NODE3";
  mq135: number;
  mq2: number;
  r1: number;
  r2: number;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string>("");

  const fetchSensors = async (node?: string) => {
    try {
      setLoading(true);
      const url = node ? `/api/status?node=${node}` : "/api/status";
      const response = await fetch(url);
      const data = await response.json();
      setSensors(data.sensors || []);
    } catch (error) {
      console.error("Error fetching sensors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors(selectedNode);
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchSensors(selectedNode);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedNode]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getNodeNumber = (type: string) => {
    return type.replace("NODE", "");
  };

  const getStatusBadge = (value: number) => {
    if (value === 1) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
          ⚠️ GAS ALERT
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          ✓ SAFE
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            Sensor Data Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Real-time sensor readings from IoT nodes
          </p>
        </div>

        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Filter by Node:
          </label>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50"
          >
            <option value="">All Nodes</option>
            <option value="1">Node 1</option>
            <option value="2">Node 2</option>
            <option value="3">Node 3</option>
          </select>
          <button
            onClick={() => fetchSensors(selectedNode)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading && sensors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading sensor data...</p>
          </div>
        ) : sensors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No sensor data available</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-100 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      MQ135
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      MQ135 Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      MQ2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      MQ2 Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      R1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      R2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Updated At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sensors.map((sensor) => (
                    <tr
                      key={sensor.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-black dark:text-zinc-50">
                            Node {getNodeNumber(sensor.type)}
                          </span>
                          <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {sensor.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-black dark:text-zinc-50">
                          {sensor.mq135}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sensor.mq135)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-black dark:text-zinc-50">
                          {sensor.mq2}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sensor.mq2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {sensor.r1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {sensor.r2}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(sensor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(sensor.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sensors.length > 0 && (
          <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Showing {sensors.length} sensor reading{sensors.length !== 1 ? "s" : ""}
            {selectedNode && ` for Node ${selectedNode}`}
          </div>
        )}
      </main>
    </div>
  );
}
