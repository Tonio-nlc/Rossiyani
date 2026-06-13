import { NextResponse } from "next/server";

import {
  deleteText,
  TextNotFoundError,
} from "@/features/texts/delete-text";
import { getTextForReader } from "@/features/texts/get-text-for-reader";
import {
  renameText,
  TextTitleValidationError,
} from "@/features/texts/rename-text";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const text = await getTextForReader(id);
  if (!text) {
    return NextResponse.json({ error: "Texte introuvable" }, { status: 404 });
  }
  return NextResponse.json({ text });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const title =
    body && typeof body === "object" && "title" in body && typeof body.title === "string"
      ? body.title
      : null;

  if (title === null) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  try {
    const text = await renameText(id, title);
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof TextTitleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof TextNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const result = await deleteText(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TextNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
