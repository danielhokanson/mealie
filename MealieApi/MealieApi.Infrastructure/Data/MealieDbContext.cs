using Microsoft.EntityFrameworkCore;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Entities.ShoppingList;
using MealieApi.Domain.Entities.Label;
using MealieApi.Domain.Entities.Food;
using MealieApi.Domain.Entities.Unit;
using MealieApi.Domain.Entities.Comment;
using MealieApi.Domain.Entities.Timeline;
using MealieApi.Domain.Entities.Admin;
using MealieApi.Domain.Entities;
using MealieApi.Domain.Enums;

namespace MealieApi.Infrastructure.Data;

/// <summary>
/// Entity Framework DbContext with TPH (Table-Per-Hierarchy) configuration
/// </summary>
public class MealieDbContext : DbContext
{
    public MealieDbContext(DbContextOptions<MealieDbContext> options) : base(options)
    {
    }

    // TPH DbSets - Base classes
    public DbSet<User> Users { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Domain.Entities.Organization.Organization> Organizations { get; set; }
    public DbSet<ContentItem> ContentItems { get; set; }
    
    // Regular DbSets
    public DbSet<ShoppingList> ShoppingLists { get; set; }
    public DbSet<ShoppingListItem> ShoppingListItems { get; set; }
    public DbSet<Label> Labels { get; set; }
    public DbSet<Food> Foods { get; set; }
    public DbSet<Unit> Units { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<TimelineEvent> TimelineEvents { get; set; }
    public DbSet<UserPreferences> UserPreferences { get; set; }
    public DbSet<SystemSettings> SystemSettings { get; set; }
    public DbSet<Backup> Backups { get; set; }
    public DbSet<MealPlan> MealPlans { get; set; }
    public DbSet<MealPlanRule> MealPlanRules { get; set; }
    
    // Derived type DbSets for easier querying
    public DbSet<StandardUser> StandardUsers { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<PublicRecipe> PublicRecipes { get; set; }
    public DbSet<PrivateRecipe> PrivateRecipes { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Household> Households { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Tool> Tools { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        ConfigureUserTPH(modelBuilder);
        ConfigureRecipeTPH(modelBuilder);
        ConfigureOrganizationTPH(modelBuilder);
        ConfigureContentItemTPH(modelBuilder);
        ConfigureShoppingList(modelBuilder);
        ConfigureNewEntities(modelBuilder);
        ConfigureRelationships(modelBuilder);
    }

    private void ConfigureUserTPH(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasDiscriminator<UserType>(u => u.UserType)
            .HasValue<StandardUser>(UserType.Standard)
            .HasValue<AdminUser>(UserType.Admin);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }

    private void ConfigureRecipeTPH(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Recipe>()
            .HasDiscriminator<RecipeType>(r => r.RecipeType)
            .HasValue<PublicRecipe>(RecipeType.Public)
            .HasValue<PrivateRecipe>(RecipeType.Private);

        modelBuilder.Entity<Recipe>()
            .HasIndex(r => r.Slug)
            .IsUnique();

        modelBuilder.Entity<Recipe>()
            .HasIndex(r => r.Name);
    }

    private void ConfigureOrganizationTPH(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Domain.Entities.Organization.Organization>()
            .HasDiscriminator<OrganizationType>(o => o.OrganizationType)
            .HasValue<Group>(OrganizationType.Group)
            .HasValue<Household>(OrganizationType.Household);

        modelBuilder.Entity<Domain.Entities.Organization.Organization>()
            .HasIndex(o => o.Name);
    }

    private void ConfigureContentItemTPH(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContentItem>()
            .HasDiscriminator<ContentItemType>(c => c.ContentItemType)
            .HasValue<Category>(ContentItemType.Category)
            .HasValue<Tag>(ContentItemType.Tag)
            .HasValue<Tool>(ContentItemType.Tool);

        modelBuilder.Entity<ContentItem>()
            .HasIndex(c => c.Name);

        modelBuilder.Entity<ContentItem>()
            .HasIndex(c => c.Slug)
            .IsUnique()
            .HasFilter("\"Slug\" IS NOT NULL");

        // Category self-referencing relationship
        modelBuilder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void ConfigureShoppingList(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShoppingList>()
            .HasIndex(sl => sl.Name);

        modelBuilder.Entity<ShoppingListItem>()
            .HasIndex(sli => sli.Name);
    }

    private void ConfigureNewEntities(ModelBuilder modelBuilder)
    {
        // UserPreferences one-to-one with User
        modelBuilder.Entity<UserPreferences>()
            .HasOne(up => up.User)
            .WithOne(u => u.Preferences)
            .HasForeignKey<UserPreferences>(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Label indexes
        modelBuilder.Entity<Label>()
            .HasIndex(l => l.Name);

        // Food indexes
        modelBuilder.Entity<Food>()
            .HasIndex(f => f.Name);

        // Unit indexes
        modelBuilder.Entity<Unit>()
            .HasIndex(u => u.Name);

        // SystemSettings unique key constraint
        modelBuilder.Entity<SystemSettings>()
            .HasIndex(ss => ss.Key)
            .IsUnique();

        // Backup indexes
        modelBuilder.Entity<Backup>()
            .HasIndex(b => b.Name);
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // User -> Recipe relationship
        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.User)
            .WithMany(u => u.Recipes)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> ShoppingList relationship
        modelBuilder.Entity<ShoppingList>()
            .HasOne(sl => sl.User)
            .WithMany(u => u.ShoppingLists)
            .HasForeignKey(sl => sl.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Organization -> ShoppingList relationship
        modelBuilder.Entity<ShoppingList>()
            .HasOne(sl => sl.Organization)
            .WithMany(o => o.ShoppingLists)
            .HasForeignKey(sl => sl.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        // ShoppingList -> ShoppingListItem relationship
        modelBuilder.Entity<ShoppingListItem>()
            .HasOne(sli => sli.ShoppingList)
            .WithMany(sl => sl.Items)
            .HasForeignKey(sli => sli.ShoppingListId)
            .OnDelete(DeleteBehavior.Cascade);

        // Recipe -> ShoppingListItem relationship (optional)
        modelBuilder.Entity<ShoppingListItem>()
            .HasOne(sli => sli.Recipe)
            .WithMany()
            .HasForeignKey(sli => sli.RecipeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Label -> ShoppingListItem relationship (optional)
        modelBuilder.Entity<ShoppingListItem>()
            .HasOne(sli => sli.Label)
            .WithMany()
            .HasForeignKey(sli => sli.LabelId)
            .OnDelete(DeleteBehavior.SetNull);

        // Recipe -> Comment relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Recipe)
            .WithMany(r => r.Comments)
            .HasForeignKey(c => c.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> Comment relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Recipe -> TimelineEvent relationship (optional)
        modelBuilder.Entity<TimelineEvent>()
            .HasOne(te => te.Recipe)
            .WithMany(r => r.TimelineEvents)
            .HasForeignKey(te => te.RecipeId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> TimelineEvent relationship
        modelBuilder.Entity<TimelineEvent>()
            .HasOne(te => te.User)
            .WithMany(u => u.TimelineEvents)
            .HasForeignKey(te => te.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Many-to-many relationships
        ConfigureManyToManyRelationships(modelBuilder);
        
        // Ignore base ContentItem navigation to recipes since it's handled by derived types
        modelBuilder.Entity<ContentItem>()
            .Ignore(c => c.Recipes);
    }

    private void ConfigureManyToManyRelationships(ModelBuilder modelBuilder)
    {
        // Recipe -> Category many-to-many
        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Categories)
            .WithMany(c => c.Recipes)
            .UsingEntity(j => j.ToTable("RecipeCategories"));

        // Recipe -> Tag many-to-many
        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Tags)
            .WithMany(t => t.Recipes)
            .UsingEntity(j => j.ToTable("RecipeTags"));

        // Recipe -> Tool many-to-many
        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Tools)
            .WithMany(t => t.Recipes)
            .UsingEntity(j => j.ToTable("RecipeTools"));

        // Organization -> User many-to-many
        modelBuilder.Entity<Domain.Entities.Organization.Organization>()
            .HasMany(o => o.Members)
            .WithMany()
            .UsingEntity(j => j.ToTable("OrganizationMembers"));

        // Organization -> Recipe many-to-many
        modelBuilder.Entity<Domain.Entities.Organization.Organization>()
            .HasMany(o => o.Recipes)
            .WithMany()
            .UsingEntity(j => j.ToTable("OrganizationRecipes"));
    }
}
