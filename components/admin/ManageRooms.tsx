"use client";
import { Translated } from "@/components/preferences/Translated";

import { useTranslate } from "@/components/preferences/PreferencesProvider";
import { Localized, Text } from "@/components/preferences/Localized";
import { useState } from "react";
import { useRouter } from "next/navigation";
const AVAILABILITY = ["unconfirmed", "available", "reserved", "occupied"];
type Room = {
    id: string;
    name: string;
    price: number | null;
    size_sqm: number | null;
    availability_status: string | null;
};
export function ManageRooms({ unitId, rooms: initialRooms, }: {
    unitId: string;
    rooms: Room[];
}) {
    const translate = useTranslate();
    const router = useRouter();
    const [rooms, setRooms] = useState(initialRooms);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    async function handleAddRoom(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
            const res = await fetch(`/api/admin/units/${unitId}/rooms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    price: formData.get("price") ? Number(formData.get("price")) : null,
                    size_sqm: formData.get("size_sqm")
                        ? Number(formData.get("size_sqm"))
                        : null,
                    availability_status: formData.get("availability_status") === "unconfirmed" ? null : formData.get("availability_status"),
                }),
            });
            if (!res.ok)
                throw new Error("Failed");
            const { room } = await res.json();
            setRooms((r) => [...r, room]);
            setShowForm(false);
            form.reset();
            router.refresh();
        }
        finally {
            setLoading(false);
        }
    }
    async function handleUpdateRoom(roomId: string, data: {
        name?: string;
        price?: number | null;
        size_sqm?: number | null;
        availability_status?: string | null;
    }) {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/units/${unitId}/rooms/${roomId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok)
                throw new Error("Failed");
            const { room } = await res.json();
            setRooms((r) => r.map((x) => (x.id === roomId ? room : x)));
            setEditingId(null);
            router.refresh();
        }
        finally {
            setLoading(false);
        }
    }
    async function handleDeleteRoom(roomId: string) {
        if (!confirm(translate("Delete this room?")))
            return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/units/${unitId}/rooms/${roomId}`, {
                method: "DELETE",
            });
            if (!res.ok)
                throw new Error("Failed");
            setRooms((r) => r.filter((x) => x.id !== roomId));
            router.refresh();
        }
        finally {
            setLoading(false);
        }
    }
    return (<div id="rooms" className="mt-12 rounded-xl border border-[#e9e3f5] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#1f2937]"><Text>Rooms</Text></h2>
      <ul className="mt-4 space-y-3">
        <Localized>{rooms.map((r) => editingId === r.id ? (<RoomEditRow key={r.id} room={r} onSave={(data) => handleUpdateRoom(r.id, data)} onCancel={() => setEditingId(null)}/>) : (<li key={r.id} className="flex items-center justify-between rounded-lg border border-[#e9e3f5] px-4 py-3">
              <div>
                <span className="font-medium"><Localized>{r.name}</Localized></span>
                <span className="ml-2 text-[#2ec4b6]">
                  <Localized>{r.price === null ? "Rent not set" : `RM ${Number(r.price).toLocaleString()}/mo`}</Localized>
                </span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${r.availability_status === "available"
                ? "bg-[#a7f3ec] text-[#1a9b8f]"
                : "bg-[#e9e3f5] text-[#8b6cb8]"}`}>
                  <Localized>{r.availability_status || "unconfirmed"}</Localized>
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingId(r.id)} className="text-sm text-[#2ec4b6] hover:underline"><Text>
                  Edit
                </Text></button>
                <button type="button" onClick={() => handleDeleteRoom(r.id)} disabled={loading} className="text-sm text-red-600 hover:underline disabled:opacity-50"><Text>
                  Delete
                </Text></button>
              </div>
            </li>))}</Localized>
      </ul>
      <Localized>{showForm ? (<form onSubmit={handleAddRoom} className="mt-4 space-y-4 rounded-lg border border-[#e9e3f5] bg-[#fefefe] p-4">
          <Translated as="input" name="name" required placeholder="Room name" className="w-full rounded-lg border border-[#e9e3f5] px-3 py-2"/>
          <Translated as="input" name="price" type="number" step="0.01" min="0" placeholder="Price" aria-label="Monthly rent (RM)" className="w-full rounded-lg border border-[#e9e3f5] px-3 py-2"/>
          <Translated as="input" name="size_sqm" type="number" step="0.01" placeholder="Size (m²)" className="w-full rounded-lg border border-[#e9e3f5] px-3 py-2"/>
          <select name="availability_status" className="rounded-lg border border-[#e9e3f5] px-3 py-2">
            <Localized>{AVAILABILITY.map((a) => (<option key={a} value={a}>
                <Localized>{a}</Localized>
              </option>))}</Localized>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-[#2ec4b6] px-4 py-2 text-sm font-medium text-white"><Text>
              Add
            </Text></button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-[#e9e3f5] px-4 py-2 text-sm"><Text>
              Cancel
            </Text></button>
          </div>
        </form>) : (<button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm font-medium text-[#2ec4b6] hover:underline"><Text>
          + Add room
        </Text></button>)}</Localized>
    </div>);
}
function RoomEditRow({ room, onSave, onCancel, }: {
    room: Room;
    onSave: (data: Partial<Room>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(room.name);
    const [price, setPrice] = useState(room.price === null ? "" : String(room.price));
    const [sizeSqm, setSizeSqm] = useState(room.size_sqm != null ? String(room.size_sqm) : "");
    const [status, setStatus] = useState(room.availability_status || "unconfirmed");
    return (<li className="flex flex-wrap items-center gap-2 rounded-lg border border-[#b19cd9] bg-[#e9e3f5]/30 p-4">
      <Translated as="input" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="w-32 rounded border px-2 py-1" placeholder="Room name" aria-label="Room name"/>
      <Translated as="input" type="number" step="0.01" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} className="w-24 rounded border px-2 py-1" placeholder="Price" aria-label="Monthly rent (RM)"/>
      <Translated as="input" type="number" step="0.01" value={sizeSqm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSizeSqm(e.target.value)} className="w-20 rounded border px-2 py-1" placeholder="m²" aria-label="Size (m²)"/>
      <Translated as="select" aria-label="Availability" value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)} className="rounded border px-2 py-1">
        <Localized>{AVAILABILITY.map((a) => (<option key={a} value={a}>
            <Localized>{a}</Localized>
          </option>))}</Localized>
      </Translated>
      <button type="button" onClick={() => onSave({
            name,
            price: price === "" ? null : Number(price),
            size_sqm: sizeSqm ? Number(sizeSqm) : null,
            availability_status: status === "unconfirmed" ? null : status,
        })} className="rounded bg-[#2ec4b6] px-3 py-1 text-sm text-white"><Text>
        Save
      </Text></button>
      <button type="button" onClick={onCancel} className="rounded border px-3 py-1 text-sm"><Text>
        Cancel
      </Text></button>
    </li>);
}
