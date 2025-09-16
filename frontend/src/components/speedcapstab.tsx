import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AddressField = {
    type: "any" | "ip" | "subnet";
    value: string;
};

export type SpeedCap = {
    ruleId?: string;
    enabled: string;
    sequence: string;
    interface: "lan" | "wan" | "opt1" | string;
    proto: "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp";
    source: AddressField[];
    destination: AddressField[];
    direction: "" | "in" | "out" | "both";
    targetType?: "pipe" | "queue";
    targetId?: string;
    description: string;
    displayInterface?: string;
    displayTarget?: string;
    displayDirection?: string;
};

export type Pipe = {
    id: string;
    bandwidth: string;
    metric: string;
    displaymetric: string;
    description: string;
};

export type Queue = {
    id: string;
    bandwidth: string;
    metric: string;
    displaymetric: string;
    description: string;
};

const SpeedCapsTab: React.FC = () => {
    const [speedCaps, setSpeedCaps] = useState<SpeedCap[]>([]);
    const [pipes, setPipes] = useState<Pipe[]>([]);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SpeedCap | null>(null);
    const [form, setForm] = useState<SpeedCap>({
        enabled: "1",
        sequence: "1",
        interface: "wan",
        proto: "ip",
        source: [{ type: "any", value: "" }],
        destination: [{ type: "any", value: "" }],
        direction: "both",
        description: "",
        targetType: "pipe",
        targetId: "",
    });
    const [interfaces, setInterfaces] = useState<{ name: string; identifier: string }[]>([]);

    const fetchSpeedCaps = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/speedcaps");
            const rows = Array.isArray(res.data.data?.rows) ? res.data.data.rows : [];
            setSpeedCaps(
                rows.map((r: any) => ({
                    ruleId: r.uuid,
                    enabled: r.enabled,
                    sequence: r.sequence,
                    interface: r.interface,
                    proto: r["%proto"] || r.proto,
                    source: (Array.isArray(r.source) ? r.source : [r.source || "any"]).map((s: string) =>
                        s === "any" ? { type: "any", value: "" } : s.includes("/") ? { type: "subnet", value: s } : { type: "ip", value: s }
                    ),
                    destination: (Array.isArray(r.destination) ? r.destination : [r.destination || "any"]).map((d: string) =>
                        d === "any" ? { type: "any", value: "" } : d.includes("/") ? { type: "subnet", value: d } : { type: "ip", value: d }
                    ),
                    direction: r.direction || "both",
                    targetId: r.target,
                    targetType: r.targetType || "pipe",
                    description: r.description,
                    displayInterface: r["%interface"],
                    displayTarget: r["%target"],
                    displayDirection: r["%direction"],
                }))
            );
        } catch (err) {
            console.error(err);
            setSpeedCaps([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPipes = async () => {
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/pipes");
            const rows = Array.isArray(res.data.data?.rows) ? res.data.data.rows : [];
            setPipes(
                rows.map((p: any) => ({
                    id: p.uuid,
                    bandwidth: p.bandwidth,
                    metric: p.bandwidthMetric,
                    displaymetric: p["%bandwidthMetric"],
                    description: p.description || `Pipe ${p.uuid}`,
                }))
            );
        } catch (err) {
            console.error("Failed to fetch pipes:", err);
            setPipes([]);
        }
    };

    const fetchQueues = async () => {
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/queues");
            const rows = Array.isArray(res.data.data?.rows)
                ? res.data.data.rows
                : Array.isArray(res.data.rows)
                    ? res.data.rows
                    : [];
            setQueues(
                rows.map((q: any) => ({
                    id: q.uuid,
                    bandwidth: q.bandwidth,
                    metric: q.bandwidthMetric,
                    displaymetric: q["%bandwidthMetric"],
                    description: q.description || `Queue ${q.uuid}`,
                }))
            );
        } catch (err) {
            console.error("Failed to fetch queues:", err);
            setQueues([]);
        }
    };

    const fetchInterfaces = async () => {
        try {
            const res = await axios.get("http://localhost:4000/network/interfaces/all");
            const rows = Array.isArray(res.data.data) ? res.data.data : [];
            const filtered = rows.filter((i: any) => i.name.toLowerCase() !== "wireless");

            setInterfaces(
                filtered.map((i: any) => ({
                    name: i.name,
                    identifier: i.identifier,
                }))
            );
        } catch (err) {
            console.error("Failed to fetch interfaces:", err);
            setInterfaces([]);
        }
    };

    useEffect(() => {
        fetchSpeedCaps();
        fetchPipes();
        fetchQueues();
        fetchInterfaces();
    }, []);

    const handleOpenAdd = () => {
        const maxSeq = Math.max(0, ...speedCaps.map((c) => parseInt(c.sequence || "0", 10)));
        setEditing(null);
        setForm({
            enabled: "1",
            sequence: String(maxSeq + 1),
            interface: "wan",
            proto: "ip",
            source: [{ type: "any", value: "" }],
            destination: [{ type: "any", value: "" }],
            direction: "both",
            description: "",
            targetType: "pipe",
            targetId: "",
        });
        setOpen(true);
    };

    const handleOpenEdit = (cap: SpeedCap) => {
        setEditing(cap);
        setForm({ ...cap });
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!form.targetId) {
                alert("Please select a target before saving.");
                return;
            }

            const payload = {
                targetType: form.targetType,
                targetId: form.targetId,
                iface: form.interface,
                proto: form.proto,
                src: form.source.map((s) => (s.type === "any" ? "any" : s.value)).join(","),
                dst: form.destination.map((d) => (d.type === "any" ? "any" : d.value)).join(","),
                direction: form.direction,
                description: form.description,
                sequence: form.sequence,
            };

            if (editing && editing.ruleId) {
                await axios.put(`http://localhost:4000/bandwidth/speedcaps/${editing.ruleId}`, payload);
                alert("Speed cap updated successfully!");
            } else {
                await axios.post("http://localhost:4000/bandwidth/speedcaps", payload);
                alert("Speed cap created successfully!");
            }

            setOpen(false);
            fetchSpeedCaps();
        } catch (err) {
            console.error(err);
            alert("Failed to save speed cap.");
        }
    };

    const handleDelete = async (ruleId?: string) => {
        if (!ruleId || !confirm("Are you sure you want to delete this rule?")) return;
        try {
            await axios.delete(`http://localhost:4000/bandwidth/speedcaps/${ruleId}`);
            alert("Speed cap deleted successfully!");
            fetchSpeedCaps();
        } catch (err) {
            console.error(err);
            alert("Failed to delete speed cap.");
        }
    };

    const getTargetDescription = (cap: SpeedCap) => {
        if (cap.targetType === "pipe") {
            return pipes.find((p) => p.id === cap.targetId)?.description || cap.displayTarget || cap.targetId;
        }
        if (cap.targetType === "queue") {
            return queues.find((q) => q.id === cap.targetId)?.description || cap.displayTarget || cap.targetId;
        }
        return cap.displayTarget || cap.targetId;
    };

    const updateSource = (idx: number, val: string) => {
        const updated = [...form.source];
        updated[idx] = { ...updated[idx], value: val };
        setForm({ ...form, source: updated });
    };

    const removeSource = (idx: number) => {
        setForm({ ...form, source: form.source.filter((_, i) => i !== idx) });
    };

    const updateDestination = (idx: number, val: string) => {
        const updated = [...form.destination];
        updated[idx] = { ...updated[idx], value: val };
        setForm({ ...form, destination: updated });
    };

    const removeDestination = (idx: number) => {
        setForm({ ...form, destination: form.destination.filter((_, i) => i !== idx) });
    };

    const isValid = (field: AddressField) => {
        if (field.type === "any") return true;
        if (field.type === "ip" && /^(\d{1,3}\.){3}\d{1,3}$/.test(field.value)) return true;
        if (field.type === "subnet" && /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(field.value)) return true;
        return false;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                <Button onClick={handleOpenAdd}>Add Speed Cap</Button>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="w-full border">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border p-2">Seq</th>
                                <th className="border p-2">Interface</th>
                                <th className="border p-2">Protocol</th>
                                <th className="border p-2">Source</th>
                                <th className="border p-2">Destination</th>
                                <th className="border p-2">Direction</th>
                                <th className="border p-2">Target</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {speedCaps.map((cap) => (
                                <tr key={cap.ruleId || cap.sequence}>
                                    <td className="border p-2">{cap.sequence}</td>
                                    <td className="border p-2">{cap.displayInterface || cap.interface}</td>
                                    <td className="border p-2">{cap.proto}</td>
                                    <td className="border p-2">{cap.source.map((s) => (s.type === "any" ? "Any" : s.value)).join(", ")}</td>
                                    <td className="border p-2">{cap.destination.map((d) => (d.type === "any" ? "Any" : d.value)).join(", ")}</td>
                                    <td className="border p-2">{cap.displayDirection || cap.direction}</td>
                                    <td className="border p-2">{getTargetDescription(cap)}</td>
                                    <td className="border p-2">{cap.description || "None"}</td>
                                    <td className="border p-2 flex gap-2 justify-center">
                                        <Button onClick={() => handleOpenEdit(cap)}>Edit</Button>
                                        <Button onClick={() => handleDelete(cap.ruleId)} className="bg-red-600">
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-6 max-w-2xl">
                    <DialogTitle>{editing ? "Edit Speed Cap" : "Add Speed Cap"}</DialogTitle>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* Source */}
                        <label className="col-span-1">
                            Source
                            {form.source.map((src, idx) => (
                                <div key={idx} className="flex gap-2 mt-1">
                                    <Input
                                        className={`w-full ${!isValid(src) && src.value ? "border-red-500" : ""}`}
                                        value={src.type === "any" ? "Any" : src.value}
                                        disabled={src.type === "any"}
                                        placeholder={
                                            src.type === "ip"
                                                ? "e.g. 192.168.1.10"
                                                : src.type === "subnet"
                                                    ? "e.g. 192.168.1.0/24"
                                                    : "Any (disabled)"
                                        }
                                        onChange={(e) => updateSource(idx, e.target.value)}
                                    />
                                    <Button variant="outline" className="text-red-600" onClick={() => removeSource(idx)}>
                                        X
                                    </Button>
                                </div>
                            ))}
                            <Select
                                onValueChange={(val) =>
                                    setForm({
                                        ...form,
                                        source: [...form.source, { type: val as "any" | "ip" | "subnet", value: "" }],
                                    })
                                }
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="+ Add Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="ip">IP</SelectItem>
                                    <SelectItem value="subnet">IP/Subnet</SelectItem>
                                </SelectContent>
                            </Select>
                        </label>

                        {/* Destination */}
                        <label className="col-span-1">
                            Destination
                            {form.destination.map((dst, idx) => (
                                <div key={idx} className="flex gap-2 mt-1">
                                    <Input
                                        className={`w-full ${!isValid(dst) && dst.value ? "border-red-500" : ""}`}
                                        value={dst.type === "any" ? "Any" : dst.value}
                                        disabled={dst.type === "any"}
                                        placeholder={
                                            dst.type === "ip"
                                                ? "e.g. 192.168.1.10"
                                                : dst.type === "subnet"
                                                    ? "e.g. 192.168.1.0/24"
                                                    : "Any (disabled)"
                                        }
                                        onChange={(e) => updateDestination(idx, e.target.value)}
                                    />
                                    <Button variant="outline" className="text-red-600" onClick={() => removeDestination(idx)}>
                                        X
                                    </Button>
                                </div>
                            ))}
                            <Select
                                onValueChange={(val) =>
                                    setForm({
                                        ...form,
                                        destination: [...form.destination, { type: val as "any" | "ip" | "subnet", value: "" }],
                                    })
                                }
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue placeholder="+ Add Destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="ip">IP</SelectItem>
                                    <SelectItem value="subnet">IP/Subnet</SelectItem>
                                </SelectContent>
                            </Select>
                        </label>

                        {/* Interface, Direction, Protocol */}
                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <label className="col-span-1">
                                Interface
                                <Select value={form.interface} onValueChange={(val) => setForm({ ...form, interface: val })}>
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select interface" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {interfaces.map((intf) => (
                                            <SelectItem key={intf.identifier} value={intf.identifier}>
                                                {intf.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>

                            <label className="col-span-1">
                                Direction
                                <Select
                                    value={form.direction}
                                    onValueChange={(val) => setForm({ ...form, direction: val as "" | "in" | "out" | "both" })}
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">In</SelectItem>
                                        <SelectItem value="out">Out</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>

                            <label className="col-span-1">
                                Protocol
                                <Select
                                    value={form.proto}
                                    onValueChange={(val) =>
                                        setForm({
                                            ...form,
                                            proto: val as "ip" | "ip4" | "ip6" | "tcp" | "udp" | "icmp",
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select protocol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ip">IP (Any)</SelectItem>
                                        <SelectItem value="ip4">IPv4</SelectItem>
                                        <SelectItem value="ip6">IPv6</SelectItem>
                                        <SelectItem value="tcp">TCP</SelectItem>
                                        <SelectItem value="udp">UDP</SelectItem>
                                        <SelectItem value="icmp">ICMP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                        </div>

                        {/* Target Type */}
                        <label className="col-span-1">
                            Target Type
                            <Select
                                value={form.targetType}
                                onValueChange={(val) => setForm({ ...form, targetType: val as "pipe" | "queue", targetId: "" })}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select target type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pipe">Pipe</SelectItem>
                                    <SelectItem value="queue">Queue</SelectItem>
                                </SelectContent>
                            </Select>
                        </label>

                        {/* Target (Pipe or Queue) */}
                        <label className="col-span-1">
                            {form.targetType === "pipe" ? "Pipe" : "Queue"}
                            <Select value={form.targetId} onValueChange={(val) => setForm({ ...form, targetId: val })}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder={`Select ${form.targetType}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {form.targetType === "pipe"
                                        ? pipes.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.description} ({p.bandwidth} {p.displaymetric})
                                            </SelectItem>
                                        ))
                                        : queues.map((q) => (
                                            <SelectItem key={q.id} value={q.id}>
                                                {q.description} ({q.bandwidth} {q.displaymetric})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </label>

                        {/* Description */}
                        <label className="col-span-2">
                            Description
                            <Input
                                className="w-full mt-1"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Enter a description"
                            />
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SpeedCapsTab;
