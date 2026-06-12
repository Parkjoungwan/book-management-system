import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
from matplotlib import font_manager
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

_korean_fonts = ['Malgun Gothic', 'NanumGothic', 'AppleGothic', 'DejaVu Sans']
for _f in _korean_fonts:
    if any(_f.lower() in fm.name.lower() for fm in font_manager.fontManager.ttflist):
        matplotlib.rcParams['font.family'] = _f
        break
matplotlib.rcParams['axes.unicode_minus'] = False

HEADER_H  = 0.65
ROW_H     = 0.50
COL_H_SEC = 0.42   # height consumed by column-label row


def _get_row_y(box_y, box_h, row_index):
    """Centre-y of a field row (0-indexed from top)."""
    top = box_y + box_h - HEADER_H - COL_H_SEC
    return top - row_index * ROW_H - ROW_H / 2 - 0.05


def draw_entity_box(ax, table_name, fields, box_x, box_y, box_w, z=2):
    """
    fields: list of (key='PK'|'FK'|'', name, dtype, constraint)
    Returns (box_h, y_positions_per_row).
    """
    n_rows  = len(fields)
    box_h   = HEADER_H + COL_H_SEC + n_rows * ROW_H + 0.2

    # Shadow
    ax.add_patch(FancyBboxPatch(
        (box_x + 0.08, box_y - 0.08), box_w, box_h,
        boxstyle="round,pad=0.05", linewidth=0, facecolor='#CED4DA', zorder=z))
    # Body
    ax.add_patch(FancyBboxPatch(
        (box_x, box_y), box_w, box_h,
        boxstyle="round,pad=0.05", linewidth=1.5,
        edgecolor='#495057', facecolor='white', zorder=z + 1))
    # Header bar
    ax.add_patch(FancyBboxPatch(
        (box_x, box_y + box_h - HEADER_H), box_w, HEADER_H,
        boxstyle="round,pad=0.05", linewidth=0, facecolor='#4263EB', zorder=z + 2))
    ax.text(box_x + box_w / 2, box_y + box_h - HEADER_H / 2, table_name,
            ha='center', va='center', fontsize=12, fontweight='bold',
            color='white', zorder=z + 3)

    # Column label row
    col_offsets = [0.12, 0.52, 1.90, 3.30]
    col_labels  = ['Key', 'Field', 'Type', 'Constraint']
    col_hdr_y   = box_y + box_h - HEADER_H - 0.28
    for cx, lbl in zip(col_offsets, col_labels):
        ax.text(box_x + cx, col_hdr_y, lbl,
                fontsize=7, color='#868E96', fontweight='bold', zorder=z + 3)
    divider_y = col_hdr_y - 0.16
    ax.plot([box_x + 0.08, box_x + box_w - 0.08], [divider_y, divider_y],
            color='#DEE2E6', linewidth=0.8, zorder=z + 3)

    row_y_list = []
    for i, (key, name, dtype, constraint) in enumerate(fields):
        y = _get_row_y(box_y, box_h, i)
        row_y_list.append(y)

        if i % 2 == 0:
            ax.add_patch(plt.Rectangle(
                (box_x + 0.05, y - ROW_H / 2 + 0.04), box_w - 0.1, ROW_H - 0.08,
                facecolor='#F1F3F5', linewidth=0, zorder=z + 2))

        if key in ('PK', 'FK'):
            clr = '#FFD43B' if key == 'PK' else '#74C0FC'
            txt_clr = '#664D03' if key == 'PK' else '#1971C2'
            ax.add_patch(FancyBboxPatch(
                (box_x + col_offsets[0] - 0.02, y - 0.13), 0.38, 0.26,
                boxstyle="round,pad=0.03", linewidth=0, facecolor=clr, zorder=z + 3))
            ax.text(box_x + col_offsets[0] + 0.17, y, key,
                    ha='center', va='center', fontsize=6.5, fontweight='bold',
                    color=txt_clr, zorder=z + 4)

        ax.text(box_x + col_offsets[1], y, name, fontsize=8.5, va='center',
                color='#212529',
                fontweight='bold' if key in ('PK', 'FK') else 'normal',
                zorder=z + 4)
        ax.text(box_x + col_offsets[2], y, dtype, fontsize=8, va='center',
                color='#1971C2', zorder=z + 4)
        ax.text(box_x + col_offsets[3], y, constraint, fontsize=7.5, va='center',
                color='#868E96', zorder=z + 4)

    return box_h, row_y_list


def _draw_one_mandatory(ax, x, y, z=10):
    """|| double bar at 1-end (right edge of table, line exits right)."""
    for dx in (0.10, 0.24):
        ax.plot([x + dx, x + dx], [y - 0.20, y + 0.20],
                color='#495057', linewidth=2.0, zorder=z, solid_capstyle='round')


def _draw_zero_or_many(ax, x, y, z=10):
    """o< zero-or-many at N-end (left edge of table, line arrives from left).
    Circle at distance, then crow's foot fanning to tip x."""
    # Circle (o)
    circle = plt.Circle((x - 0.36, y), 0.12,
                         color='#495057', fill=False, linewidth=1.8, zorder=z)
    ax.add_patch(circle)
    # Crow's foot (3 lines fanning from x-0.16 to x)
    for dy in (-0.17, 0.0, 0.17):
        ax.plot([x - 0.18, x], [y + dy, y],
                color='#495057', linewidth=1.5, zorder=z, solid_capstyle='round')


def _connect(ax, x1, y1, x2, y2, z=10):
    """Connect 1-end (x1,y1) to 0..N-end (x2,y2) with crow's foot notation."""
    mid_x = (x1 + x2) / 2
    ax.plot([x1, mid_x, mid_x, x2], [y1, y1, y2, y2],
            color='#868E96', linewidth=1.5, zorder=z, solid_capstyle='round')
    _draw_one_mandatory(ax, x1, y1, z=z + 1)
    _draw_zero_or_many(ax, x2, y2, z=z + 1)


def draw_erd():
    users_fields = [
        ('PK', 'id',         'BIGINT',       'AUTO_INCREMENT'),
        ('',   'email',      'VARCHAR(100)', 'UNIQUE NOT NULL'),
        ('',   'name',       'VARCHAR(100)', 'NOT NULL'),
        ('',   'password',   'VARCHAR',      'BCrypt NOT NULL'),
        ('',   'created_at', 'TIMESTAMP',    'auto'),
    ]
    book_fields = [
        ('PK', 'id',              'BIGINT',       'AUTO_INCREMENT'),
        ('FK', 'user_id',         'BIGINT',       'nullable'),
        ('',   'title',           'VARCHAR(255)', 'NOT NULL'),
        ('',   'author',          'VARCHAR(255)', 'nullable'),
        ('',   'content',         'TEXT',         'NOT NULL'),
        ('',   'cover_image_url', 'CLOB',         'nullable'),
        ('',   'created_at',      'TIMESTAMP',    'auto'),
        ('',   'updated_at',      'TIMESTAMP',    'auto'),
    ]
    cover_fields = [
        ('PK', 'id',            'BIGINT',    'AUTO_INCREMENT'),
        ('FK', 'book_id',       'BIGINT',    'NOT NULL'),
        ('',   'image_url',     'TEXT',      'NOT NULL'),
        ('',   'quality',       'VARCHAR',   'nullable'),
        ('',   'size',          'VARCHAR',   'nullable'),
        ('',   'output_format', 'VARCHAR',   'nullable'),
        ('',   'is_active',     'BOOLEAN',   'NOT NULL'),
        ('',   'created_at',    'TIMESTAMP', 'auto'),
    ]

    BOX_W = 4.8
    GAP   = 1.4
    fig_w = 3 * BOX_W + 2 * GAP + 1.6
    fig_h = 11

    fig, ax = plt.subplots(figsize=(fig_w, fig_h))
    ax.set_xlim(0, fig_w - 1.6)
    ax.set_ylim(0, fig_h)
    ax.axis('off')
    fig.patch.set_facecolor('#F8F9FA')

    box_y = 1.2

    u_x = 0.0
    b_x = BOX_W + GAP
    c_x = 2 * (BOX_W + GAP)

    u_h, u_rows = draw_entity_box(ax, 'USERS',      users_fields, u_x, box_y, BOX_W)
    b_h, b_rows = draw_entity_box(ax, 'BOOK',       book_fields,  b_x, box_y, BOX_W)
    c_h, c_rows = draw_entity_box(ax, 'BOOK_COVER', cover_fields, c_x, box_y, BOX_W)

    # users.id (row 0) → book.user_id (row 1)
    _connect(ax,
             u_x + BOX_W, u_rows[0],
             b_x,         b_rows[1])

    # book.id (row 0) → book_cover.book_id (row 1)
    _connect(ax,
             b_x + BOX_W, b_rows[0],
             c_x,         c_rows[1])

    note = ('is_active : 대표 표지 여부 (한 책에 하나만 true)  |  '
            'Book 삭제 시 BookCover cascade 삭제')
    fig.text(0.5, 0.01, note, ha='center', fontsize=9, color='#868E96')

    ax.set_title('ERD — 도서관리 시스템', fontsize=15, fontweight='bold',
                 color='#212529', pad=12)

    out = os.path.join(OUTPUT_DIR, 'erd.png')
    plt.tight_layout(rect=[0, 0.03, 1, 1])
    plt.savefig(out, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f'Saved: {out}')


def draw_api_spec():
    # (section, method, endpoint, request, response, description)
    # section: True = section-header row, False = data row
    ROWS = [
        # --- auth ---
        (True,  '',       '인증 API  /auth  (공개)',                  '',                              '',               ''),
        (False, 'POST',   '/auth/signup',                              'email*, name*, password* (8+)', '201 userId',     '회원가입'),
        (False, 'POST',   '/auth/login',                               'email*, password*',             '200 token+user', '로그인'),
        # --- books ---
        (True,  '',       '도서 API  /books  (GET 공개, 나머지 [인증])',   '',                              '',               ''),
        (False, 'GET',    '/books',                                    '?search,page,size,sort',        '200 Page<Book>', '목록 조회'),
        (False, 'GET',    '/books/{id}',                               '—',                             '200 Book',       '상세 조회'),
        (False, 'POST',   '/books',                                    'title*, content*, author',      '201 Book',       '도서 등록'),
        (False, 'PATCH',  '/books/{id}',                               'title?, author?, content?',     '200 Book',       '부분 수정'),
        (False, 'DELETE', '/books/{id}',                               '—',                             '204',            '도서 삭제'),
        (False, 'PATCH',  '/books/{id}/cover',                         'coverImageUrl',                 '200 Book',       '표지 URL 저장'),
        (False, 'POST',   '/books/{id}/cover/generate',                'apiKey*, quality, size…',       '200 Book',       'AI 표지 생성'),
        # --- covers ---
        (True,  '',       '표지 이력 API  /books/{bookId}/covers  [인증]', '',                              '',               ''),
        (False, 'GET',    '…/covers',                                  '—',                             '200 Cover[]',    '이력 목록'),
        (False, 'POST',   '…/covers',                                  'imageUrl*, quality, size…',     '201 Cover',      '이력 저장'),
        (False, 'PATCH',  '…/covers/{coverId}/activate',               '—',                             '200 Cover',      '대표 표지 지정'),
        (False, 'DELETE', '…/covers/{coverId}',                        '—',                             '204',            '이력 삭제'),
    ]

    METHOD_COLORS = {
        'GET':    '#2F9E44',
        'POST':   '#1971C2',
        'PATCH':  '#E67700',
        'DELETE': '#C92A2A',
    }

    # col widths: #idx, method, endpoint, request, response, description
    COL_W = [0.40, 0.72, 3.60, 2.80, 1.60, 2.10]
    col_x = [0.0]
    for w in COL_W[:-1]:
        col_x.append(col_x[-1] + w)
    total_w = sum(COL_W)

    DATA_ROW_H = 0.52
    SEC_ROW_H  = 0.40
    fig_w = total_w + 1.4

    total_h = sum(SEC_ROW_H if r[0] else DATA_ROW_H for r in ROWS) + DATA_ROW_H  # +1 for header
    fig_h   = total_h + 1.8

    fig, ax = plt.subplots(figsize=(fig_w, fig_h))
    ax.set_xlim(0, total_w)
    ax.set_ylim(0, total_h)
    ax.axis('off')
    fig.patch.set_facecolor('#F8F9FA')

    # Header row
    HEADER_LABELS = ['#', 'Method', 'Endpoint', 'Request Body', 'Response', 'Description']
    hdr_y = total_h - DATA_ROW_H
    ax.add_patch(plt.Rectangle((0, hdr_y), total_w, DATA_ROW_H,
                                facecolor='#4263EB', linewidth=0, zorder=1))
    for cx, cw, lbl in zip(col_x, COL_W, HEADER_LABELS):
        ax.text(cx + 0.08, hdr_y + DATA_ROW_H / 2, lbl,
                fontsize=9, fontweight='bold', color='white', va='center', zorder=3)

    # Data / section rows
    y_cursor = hdr_y
    data_idx = 0
    for (is_sec, method, endpoint, req, resp, desc) in ROWS:
        rh = SEC_ROW_H if is_sec else DATA_ROW_H
        y_cursor -= rh

        if is_sec:
            ax.add_patch(plt.Rectangle((0, y_cursor), total_w, rh,
                                        facecolor='#E9ECEF', linewidth=0, zorder=1))
            ax.text(0.10, y_cursor + rh / 2, endpoint,
                    fontsize=8.5, fontweight='bold', color='#495057', va='center', zorder=3)
            ax.plot([0, total_w], [y_cursor, y_cursor],
                    color='#ADB5BD', linewidth=0.8, zorder=2)
        else:
            bg = '#FFFFFF' if data_idx % 2 == 0 else '#F8F9FA'
            ax.add_patch(plt.Rectangle((0, y_cursor), total_w, rh,
                                        facecolor=bg, linewidth=0, zorder=1))
            data_idx += 1

            # Row number
            ax.text(col_x[0] + 0.08, y_cursor + rh / 2, str(data_idx),
                    fontsize=8, color='#ADB5BD', va='center', zorder=3)

            # Method badge
            if method in METHOD_COLORS:
                ax.add_patch(FancyBboxPatch(
                    (col_x[1] + 0.04, y_cursor + 0.08), COL_W[1] - 0.08, rh - 0.16,
                    boxstyle="round,pad=0.04", linewidth=0,
                    facecolor=METHOD_COLORS[method], zorder=2))
                ax.text(col_x[1] + COL_W[1] / 2, y_cursor + rh / 2, method,
                        fontsize=7.5, fontweight='bold', color='white',
                        ha='center', va='center', zorder=3)

            ax.text(col_x[2] + 0.08, y_cursor + rh / 2, endpoint,
                    fontsize=8, color='#1971C2', va='center', zorder=3)
            ax.text(col_x[3] + 0.08, y_cursor + rh / 2, req,
                    fontsize=7.5, color='#495057', va='center', zorder=3)
            ax.text(col_x[4] + 0.08, y_cursor + rh / 2, resp,
                    fontsize=7.5, color='#495057', va='center', zorder=3)
            ax.text(col_x[5] + 0.08, y_cursor + rh / 2, desc,
                    fontsize=8, color='#212529', va='center', zorder=3)

            ax.plot([0, total_w], [y_cursor, y_cursor],
                    color='#DEE2E6', linewidth=0.4, zorder=2)

    # Outer border
    ax.add_patch(plt.Rectangle((0, 0), total_w, total_h,
                                fill=False, edgecolor='#ADB5BD', linewidth=1.5, zorder=4))
    for cx in col_x[1:]:
        ax.plot([cx, cx], [0, total_h], color='#DEE2E6', linewidth=0.4, zorder=3)

    note = ('* 필수 필드   ? 선택 필드   [인증] JWT Bearer 필요   |   '
            '오류: 404 도서/표지 없음 · 400 검증 실패 · 400 소유권 불일치 · 401/403 인증 실패')
    fig.text(0.5, 0.01, note, ha='center', fontsize=7.5, color='#868E96')

    ax.set_title('API 명세서 — 도서관리 시스템 REST API', fontsize=13,
                 fontweight='bold', color='#212529', pad=10)

    out = os.path.join(OUTPUT_DIR, 'api_spec.png')
    plt.tight_layout(rect=[0, 0.03, 1, 1])
    plt.savefig(out, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f'Saved: {out}')


if __name__ == '__main__':
    draw_erd()
    draw_api_spec()
    print('Done.')
