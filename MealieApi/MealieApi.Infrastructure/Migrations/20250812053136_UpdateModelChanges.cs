using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MealieApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RecipeCategoryId",
                table: "Recipes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RecipeTagId",
                table: "Recipes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MealPlanRuleId",
                table: "Organizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MealPlanRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: true),
                    Day = table.Column<string>(type: "text", nullable: false),
                    EntryType = table.Column<string>(type: "text", nullable: false),
                    QueryFilterString = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPlanRules_Organizations_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealPlanRules_Organizations_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "Organizations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MealPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EntryType = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPlans_Organizations_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealPlans_Organizations_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MealPlans_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MealPlans_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecipeTag",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeTag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MealPlanRuleRecipeCategory",
                columns: table => new
                {
                    CategoriesId = table.Column<Guid>(type: "uuid", nullable: false),
                    MealPlanRulesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanRuleRecipeCategory", x => new { x.CategoriesId, x.MealPlanRulesId });
                    table.ForeignKey(
                        name: "FK_MealPlanRuleRecipeCategory_MealPlanRules_MealPlanRulesId",
                        column: x => x.MealPlanRulesId,
                        principalTable: "MealPlanRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealPlanRuleRecipeCategory_RecipeCategory_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "RecipeCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealPlanRuleRecipeTag",
                columns: table => new
                {
                    MealPlanRulesId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanRuleRecipeTag", x => new { x.MealPlanRulesId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_MealPlanRuleRecipeTag_MealPlanRules_MealPlanRulesId",
                        column: x => x.MealPlanRulesId,
                        principalTable: "MealPlanRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealPlanRuleRecipeTag_RecipeTag_TagsId",
                        column: x => x.TagsId,
                        principalTable: "RecipeTag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_RecipeCategoryId",
                table: "Recipes",
                column: "RecipeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_RecipeTagId",
                table: "Recipes",
                column: "RecipeTagId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_MealPlanRuleId",
                table: "Organizations",
                column: "MealPlanRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanRuleRecipeCategory_MealPlanRulesId",
                table: "MealPlanRuleRecipeCategory",
                column: "MealPlanRulesId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanRuleRecipeTag_TagsId",
                table: "MealPlanRuleRecipeTag",
                column: "TagsId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanRules_GroupId",
                table: "MealPlanRules",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanRules_HouseholdId",
                table: "MealPlanRules",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_GroupId",
                table: "MealPlans",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_HouseholdId",
                table: "MealPlans",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_RecipeId",
                table: "MealPlans",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlans_UserId",
                table: "MealPlans",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_MealPlanRules_MealPlanRuleId",
                table: "Organizations",
                column: "MealPlanRuleId",
                principalTable: "MealPlanRules",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_RecipeCategory_RecipeCategoryId",
                table: "Recipes",
                column: "RecipeCategoryId",
                principalTable: "RecipeCategory",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_RecipeTag_RecipeTagId",
                table: "Recipes",
                column: "RecipeTagId",
                principalTable: "RecipeTag",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_MealPlanRules_MealPlanRuleId",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Recipes_RecipeCategory_RecipeCategoryId",
                table: "Recipes");

            migrationBuilder.DropForeignKey(
                name: "FK_Recipes_RecipeTag_RecipeTagId",
                table: "Recipes");

            migrationBuilder.DropTable(
                name: "MealPlanRuleRecipeCategory");

            migrationBuilder.DropTable(
                name: "MealPlanRuleRecipeTag");

            migrationBuilder.DropTable(
                name: "MealPlans");

            migrationBuilder.DropTable(
                name: "RecipeCategory");

            migrationBuilder.DropTable(
                name: "MealPlanRules");

            migrationBuilder.DropTable(
                name: "RecipeTag");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_RecipeCategoryId",
                table: "Recipes");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_RecipeTagId",
                table: "Recipes");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_MealPlanRuleId",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "RecipeCategoryId",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "RecipeTagId",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "MealPlanRuleId",
                table: "Organizations");
        }
    }
}
